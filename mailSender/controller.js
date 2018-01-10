const {createMailHtml, createOptions, sendMail} = require('./lib')

module.exports = async (request, response) => {
  const {identifier} = request.params
  const {params = {}, to} = request.body
  if (!to) {
    return response.status(400).json({
      message: "property to is required"
    })
  }
  try {
    const html = await createMailHtml(identifier, params.content)
    const options = createOptions(identifier, to, html, params.subject)
    const info = await sendMail(options)
    response.end(`Message sent ${identifier} ${info.messageId}`)
  } catch (e) {
    response.end(e.message)
  }
}
