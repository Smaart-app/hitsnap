window.sendEmail = async function ({ name, email, message }) {
  console.log('📤 Sending Email with:', { name, email, message });

  const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: 'service_rmsqduf',
      template_id: 'template_ewoapex',
      user_id: 'Tfu4LjZEcoZIh-UtA',
      template_params: {
        user_name: name || '(χωρίς όνομα)',
        user_email: email || '(χωρίς email)',
        message: message || '(κενό)',
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error('EmailJS error: ' + err);
  }

  return await res.text();
};
