import { createSupabaseServerClient } from '@/lib/supabaseClient';
import { getGoogleTokens } from '@/lib/google-calendar';

// Simple encryption/decryption using Node.js crypto (for development)
// In production, use a proper encryption service like AWS KMS or Azure Key Vault
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-character-secret-key-here'; // 32 bytes
const ALGORITHM = 'aes-256-cbc';

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(encryptedText: string): string {
  const textParts = encryptedText.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedData = textParts.join(':');
  const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export interface GoogleTokens {
  access_token: string;
  refresh_token?: string;
  scope: string;
  token_type: string;
  expiry_date?: number;
}

export interface StoredGoogleTokens {
  id: string;
  user_id: string;
  encrypted_tokens: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
}

/**
 * Store Google OAuth tokens securely for a user
 */
export async function storeGoogleTokens(userId: string, tokens: GoogleTokens): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createSupabaseServerClient();
    
    // Encrypt the tokens
    const encryptedTokens = encrypt(JSON.stringify(tokens));
    
    // Calculate expiry date
    const expiresAt = tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null;
    
    // Check if tokens already exist for this user
    const { data: existingTokens, error: checkError } = await supabase
      .from('google_oauth_tokens')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing tokens:', checkError);
      return { success: false, error: 'Failed to check existing tokens' };
    }

    if (existingTokens) {
      // Update existing tokens
      const { error: updateError } = await supabase
        .from('google_oauth_tokens')
        .update({
          encrypted_tokens: encryptedTokens,
          updated_at: new Date().toISOString(),
          expires_at: expiresAt
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error updating Google tokens:', updateError);
        return { success: false, error: 'Failed to update tokens' };
      }
    } else {
      // Insert new tokens
      const { error: insertError } = await supabase
        .from('google_oauth_tokens')
        .insert({
          user_id: userId,
          encrypted_tokens: encryptedTokens,
          expires_at: expiresAt
        });

      if (insertError) {
        console.error('Error storing Google tokens:', insertError);
        return { success: false, error: 'Failed to store tokens' };
      }
    }

    console.log(`Google tokens stored successfully for user ${userId}`);
    return { success: true };

  } catch (error) {
    console.error('Error in storeGoogleTokens:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Retrieve and decrypt Google OAuth tokens for a user
 */
export async function getGoogleTokensForUser(userId: string): Promise<{ success: boolean; tokens?: GoogleTokens; error?: string }> {
  try {
    const supabase = createSupabaseServerClient();
    
    const { data: storedTokens, error: fetchError } = await supabase
      .from('google_oauth_tokens')
      .select('encrypted_tokens, expires_at')
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return { success: false, error: 'No tokens found for user' };
      }
      console.error('Error fetching Google tokens:', fetchError);
      return { success: false, error: 'Failed to fetch tokens' };
    }

    // Check if tokens are expired
    if (storedTokens.expires_at && new Date(storedTokens.expires_at) < new Date()) {
      return { success: false, error: 'Tokens expired' };
    }

    // Decrypt the tokens
    const decryptedTokens = JSON.parse(decrypt(storedTokens.encrypted_tokens)) as GoogleTokens;
    
    return { success: true, tokens: decryptedTokens };

  } catch (error) {
    console.error('Error in getGoogleTokensForUser:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Refresh Google OAuth tokens if needed
 */
export async function refreshGoogleTokensIfNeeded(userId: string): Promise<{ success: boolean; tokens?: GoogleTokens; error?: string }> {
  try {
    const tokenResult = await getGoogleTokensForUser(userId);
    
    if (!tokenResult.success) {
      return tokenResult;
    }

    const tokens = tokenResult.tokens!;
    
    // Check if access token is expired (with 5 minute buffer)
    const now = Date.now();
    const expiryBuffer = 5 * 60 * 1000; // 5 minutes
    
    if (tokens.expiry_date && (tokens.expiry_date - now) < expiryBuffer) {
      if (!tokens.refresh_token) {
        return { success: false, error: 'No refresh token available' };
      }

      // Refresh the tokens
      const refreshedTokens = await refreshAccessToken(tokens.refresh_token);
      
      // Merge refreshed tokens with existing tokens
      const updatedTokens: GoogleTokens = {
        ...tokens,
        ...refreshedTokens,
        refresh_token: tokens.refresh_token // Keep the original refresh token
      };

      // Store the updated tokens
      const storeResult = await storeGoogleTokens(userId, updatedTokens);
      if (!storeResult.success) {
        return { success: false, error: storeResult.error };
      }

      return { success: true, tokens: updatedTokens };
    }

    return { success: true, tokens };

  } catch (error) {
    console.error('Error in refreshGoogleTokensIfNeeded:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Delete Google OAuth tokens for a user
 */
export async function deleteGoogleTokens(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createSupabaseServerClient();
    
    const { error: deleteError } = await supabase
      .from('google_oauth_tokens')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Error deleting Google tokens:', deleteError);
      return { success: false, error: 'Failed to delete tokens' };
    }

    console.log(`Google tokens deleted successfully for user ${userId}`);
    return { success: true };

  } catch (error) {
    console.error('Error in deleteGoogleTokens:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Refresh access token using refresh token
 */
async function refreshAccessToken(refreshToken: string): Promise<Partial<GoogleTokens>> {
  const { google } = await import('googleapis');
  
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({ refresh_token: refreshToken });
  
  try {
    const { credentials } = await oauth2Client.refreshAccessToken();
    return credentials;
  } catch (error) {
    console.error('Error refreshing access token:', error);
    throw error;
  }
}

/**
 * Exchange authorization code for tokens and store them
 */
export async function exchangeCodeForTokens(userId: string, code: string): Promise<{ success: boolean; tokens?: GoogleTokens; error?: string }> {
  try {
    // Get tokens from Google
    const tokens = await getGoogleTokens(code);
    
    // Store tokens securely
    const storeResult = await storeGoogleTokens(userId, tokens);
    if (!storeResult.success) {
      return { success: false, error: storeResult.error };
    }

    return { success: true, tokens };

  } catch (error) {
    console.error('Error in exchangeCodeForTokens:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}


