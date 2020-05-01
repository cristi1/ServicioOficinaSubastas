var nJwt = require('njwt')

module.exports.validarScope = function (jwt, buscado) {
  const scope = jwt.body.scope
  let i = 0
  for (i; i < scope.length; i++) {
    const encontrado = scope[i].toLowerCase()
    if (encontrado === buscado) {
      return true
    }
  }
  return false
}
