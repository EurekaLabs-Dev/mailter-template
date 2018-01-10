const {Router} = require('express')
const controller = require('./controller')

const router = new Router()
router.post('/:identifier', controller)

module.exports = router



