const nodemailer = require('nodemailer')
const stringTemplate = require('string-template')
const resources = require('./config/resources.json')
const jade = require('jade')
var path = require('path');

const getConfig = () => {
  if (!process.env.NODE_ENV) {
    return require('./config/mailSender.json')
  }
  return require(`./config/mailSender.${process.env.NODE_ENV}.json`)
}

const getResource = identifier => {
  const resource = resources[identifier]
  if (!resource) {
    return { error: `Resource not found for identifier ${identifier}` }
  }
  return resource
}

const createOptions = (identifier, to, html, subjectParams = {}) => {
  const config = getConfig()
  const resource = getResource(identifier)
  if (resource.error) return resource

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
  if (resource.error) return resource
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
  console.log(config)
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure, // true for 465, false for other ports
    auth: {
      user: config.user,
      pass: config.password
    }
  })

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
