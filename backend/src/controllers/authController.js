const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase');
const { JWT_SECRET } = require('../middlewares/auth');
const { detectUserRole } = require('../utils/roleDetector');

/**
 * Register a new user
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('[Auth Register Error]:', checkError);
      return res.status(500).json({
        success: false,
        message: 'Database connection error during registration. Please check if Supabase is running.'
      });
    }

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists.'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Determine initial role
    const userRole = detectUserRole(email);

    // Insert user into Supabase
    console.log('Attempting Supabase insert...');
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          email: email.toLowerCase().trim(),
          password_hash: hashedPassword,
          name: name || email.split('@')[0],
          role: userRole
        }
      ])
      .select('id, email, name, role, created_at')
      .single();

    if (insertError) {
      console.error('Supabase Error:', insertError);
      console.error('[Auth Insert Error]:', insertError);
      return res.status(500).json({
        success: false,
        message: 'Database error during registration: ' + insertError.message
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        displayname: newUser.name,
        role: newUser.role || userRole
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        displayname: newUser.name,
        role: newUser.role || userRole
      }
    });
  } catch (error) {
    console.error('[Register Exception]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error during registration.'
    });
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    // Fetch user from Supabase
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    console.log('[Login Debug] Fetched user:', user);

    if (fetchError || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const hash = user.password_hash || user.password;
    if (!hash) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const userRole = user.role || detectUserRole(user.email);

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        displayname: user.name,
        role: userRole
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        displayname: user.name,
        role: userRole
      }
    });
  } catch (error) {
    console.error('[Login Exception]:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during login.'
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.user.id;

    // Update user in Supabase
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ role: role })
      .eq('id', userId)
      .select('id, email, name, role, created_at')
      .single();

    if (updateError) {
      console.error('[Update Profile Error]:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Database error updating profile.'
      });
    }

    // Generate new JWT with updated role
    const token = jwt.sign(
      {
        id: updatedUser.id,
        email: updatedUser.email,
        displayname: updatedUser.name,
        role: updatedUser.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      token,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        displayname: updatedUser.name,
        role: updatedUser.role
      }
    });

  } catch (error) {
    console.error('[Update Profile Exception]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error during profile update.'
    });
  }
};

module.exports = {
  register,
  login,
  updateProfile
};
