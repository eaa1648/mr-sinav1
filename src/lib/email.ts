// Mock email service for development
// In production, this would integrate with a real email service like SendGrid, AWS SES, etc.

export async function sendPasswordResetEmail(
  email: string,
  firstName: string,
  lastName: string,
  resetToken: string
): Promise<void> {
  // In a real implementation, this would send an actual email
  console.log(`Password reset email would be sent to: ${email}`)
  console.log(`Recipient: ${firstName} ${lastName}`)
  console.log(`Reset token: ${resetToken}`)
  console.log(`Reset link: https://mrsina.com/reset-password?token=${resetToken}`)
  
  // Simulate email sending delay
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // For now, we'll just log the email content
  console.log(`
    TO: ${email}
    SUBJECT: Mr. Sina - Şifre Sıfırlama İsteği
    
    Sayın ${firstName} ${lastName},
    
    Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayınız:
    https://mrsina.com/reset-password?token=${resetToken}
    
    Bu bağlantı 1 saat içinde geçerliliğini yitirecektir.
    
    Eğer bu isteği siz yapmadıysanız, lütfen bu e-postayı dikkate almayınız.
    
    Saygılarımızla,
    Mr. Sina Ekibi
  `)
}