const nodemailer = require('nodemailer')
const stringTemplate = require('string-template')
const jade = require('jade')
const path = require('path')
const inlineBase64 = require('nodemailer-plugin-inline-base64')


const getConfig = () => {
  if (!process.env.NODE_ENV) {
    return require('./config/mailSender.json')
  }
  return require(`./config/mailSender.${process.env.NODE_ENV}.json`)
}

const getResource = identifier => {
  const name = require.resolve('./config/resources.json')
  delete require.cache[name]
  const resources = require('./config/resources.json')
  const resource = resources[identifier]
  if (!resource) {
    throw Error(`Resource not found for identifier ${identifier}`)
  }
  return resource
}

const createOptions = (identifier, to, html, subjectParams = {}) => {
  const config = getConfig()
  const resource = getResource(identifier)
  return {
    error: false,
    from: config.from,
    to,
    subject: stringTemplate(resource.subject, subjectParams),
    html
  }
}

const createMailHtml = (identifier, content) => {
  const resource = getResource(identifier)
  const templatePath = path.join(__dirname, 'templates', resource.template + '.jade')
  return new Promise((resolve, reject) => {
    jade.renderFile(templatePath, content, (err, data) => {
      if (err) {
        return reject(err)
      }
      resolve(data)
    })
  })
}

const sendMail = options => {
  const config = getConfig()
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure, // true for 465, false for other ports
    auth: {
      user: config.user,
      pass: config.password
    }
  })
  transporter.use('compile', inlineBase64())
  return new Promise((resolve, reject) => {
    transporter.sendMail(options, (error, info) => {
      if (error) {
        return reject(error)
      }
      resolve(info)
    })
  })
}

module.exports = {
  createMailHtml,
  createOptions,
  sendMail,
}
