window.sendEmail = async function (payload) {
  const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: 'service_rmsqduf',
      template_id: 'template_ewoapex',
      user_id: 'Tfu4LjZEcoZIh-UtA',
      template_params: payload
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error('EmailJS error: ' + err);
  }

  return await res.text();
};
