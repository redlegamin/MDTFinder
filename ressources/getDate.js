const getDate = (string) => {
    mois = ["janvier","fevrier","mars","avril","mai","juin","juillet","aout","septembre","octobre","novembre","decembre"]
    string = string.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    if(mois.includes(string)) {
        var moisOutput = mois.indexOf(string) + 1
        if(moisOutput < 10) moisOutput = "0" + moisOutput
        return moisOutput
      }
    string = parseInt(string)
    if(typeof string == "number" && string <= new Date().getYear() + 1900 && string >= 2018) return string
  }

exports.getDate = getDate

