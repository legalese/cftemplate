'use strict'
var Species;
(function (Species) {
  Species[Species['Cap'] = 0] = 'Cap'
  Species[Species['Discount'] = 1] = 'Discount'
  Species[Species['CapDiscount'] = 2] = 'CapDiscount'
  Species[Species['MFN'] = 3] = 'MFN'
})(Species || (Species = {}))
function nonzero (input) {
  return Number(input.replace(/[^\d.]/g, '')) > 0
}
function myAssign (obj1, obj2) {
  var rv = {}
  Object.getOwnPropertyNames(obj2).forEach(function (name) {
    rv[name] = obj2[name]
  })
  Object.getOwnPropertyNames(obj1).forEach(function (name) {
    rv[name] = obj1[name]
  })
  return rv
}
function guessSpecies (userJSON) {
  var controlJSON = {
    Cap: false,
    Discount: false,
    CapDiscount: false,
    MFN: false
  }
  var discountRate = userJSON['Discount Rate']
  if (discountRate && nonzero(discountRate)) { controlJSON.Discount = true }
  var cap = userJSON['Valuation Cap']
  if (cap && nonzero(cap)) { controlJSON.Cap = true }
  var species
  if (controlJSON.Discount && controlJSON.Cap) {
    species = Species.CapDiscount
    controlJSON.CapDiscount = true
  } else if (controlJSON.Discount) {
    species = Species.Discount
  } else if (controlJSON.Cap) {
    species = Species.Cap
  } else {
    species = Species.MFN
    controlJSON.MFN = true
  }
  return [controlJSON, species]
}
function validate (species, controljson, userjson) {
    // does typescript approve of the JSON object?
    // or should we be using http://json-schema.org/
  return [false, 'this is fine.']
}
module.exports = function (inputJSON) {
    // standard linter doesn't like the js that tsc produces from this:
    // let [ControlJSON, guessedSpecies] = guessSpecies(inputJSON);
    // let [validationError, validationRv] = validate(guessedSpecies, ControlJSON, inputJSON);
    // so doing it the verbose way:
  var temp1 = guessSpecies(inputJSON)
  var ControlJSON = temp1[0]
  var guessedSpecies = temp1[1]
  var temp2 = validate(guessedSpecies, ControlJSON, inputJSON) // should be either a Cap, Discount, CapDiscount, or MFN -- can typescript do that?
  var validationError = temp2[0]
  var validationRv = temp2[1]
  if (validationError) {
    throw Error('VALIDATION ERROR: ' + validationRv)
  } else {
    return myAssign(ControlJSON, inputJSON)
  }
}
