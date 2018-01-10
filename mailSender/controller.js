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
    const html = await createMailHtml(identifier, params)
    const options = createOptions(identifier, to, html, params)
    const info = await sendMail(options)
    response.end(`Message sent ${identifier} ${info.messageId}`)
  } catch (e) {
    response.status(400).end(e.message)
  }
}
