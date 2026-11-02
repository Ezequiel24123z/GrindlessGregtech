// priority: -10124
// Gregtech Grindless - AF-W: can the wireless adapter read a Java long above 2^53 exactly in this Rhino? (TEST-ONLY overlay.)
// No world: the check calls the same Java methods the adapter reads (long getters) on known values.
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server -Slots 1 `
//     -Commands 'kubejs custom_command gg_test_wireless_precision' -WaitForLog 'GGTEST\|wireless_precision\|DONE@@120'
//
// Markers: GGTEST|wireless_precision|<check>|PASS|FAIL|NOTE|<detail>; the last line is GGTEST|wireless_precision|DONE.
//   ROUTE_n   one way to turn a long result into digits (NOTE: what it printed)
//   EXACT     global.grindless.wirelessAdapters.gtmDeps().exact gives the exact digits for 2^53 + 1, 2^62 + 1 and Long.MAX_VALUE
// var + function everywhere.
(function () {
  var TAG = 'GGTEST|wireless_precision|'
  function emit(name, status, detail) {
    var line = TAG + name + '|' + status
    if (detail !== undefined && detail !== null && String(detail) !== '') line += '|' + String(detail).replace(/[\r\n|]+/g, ' ').substring(0, 600)
    console.info(line)
  }

  ServerEvents.customCommand('gg_test_wireless_precision', function (event) {
    var Long = Java.loadClass('java.lang.Long')
    var Objects = Java.loadClass('java.util.Objects')
    var BigInteger = Java.loadClass('java.math.BigInteger')
    var Str = Java.loadClass('java.lang.String')
    var values = ['9007199254740993', '4611686018427387905', '9223372036854775807']
    values.forEach(function (digits) {
      var x
      try {
        x = Long.parseLong(digits)
      } catch (e) {
        emit('ROUTE_parse_' + digits, 'NOTE', 'parseLong threw ' + e)
        return
      }
      var routes = {
        a_String: function () { return String(x) },
        b_concat: function () { return '' + x },
        c_LongToString: function () { return String(Long.toString(x)) },
        d_Objects: function () { return String(Objects.toString(x)) },
        e_BigIntegerValueOf: function () { return String(BigInteger.valueOf(x).toString()) },
        f_method: function () { return String(x.toString()) },
        g_StrValueOf: function () { return String(Str.valueOf(x)) },
        h_typeof: function () { return typeof x + ' ' + (x === null ? 'null' : x.getClass ? String(x.getClass().getName()) : 'nojava') },
        i_Number: function () { return String(Number(x)) }
      }
      Object.keys(routes).forEach(function (k) {
        var r
        try { r = routes[k]() } catch (e) { r = 'threw ' + e }
        emit('ROUTE_' + k + '_' + digits, 'NOTE', r + (r === digits ? ' EXACT' : ''))
      })
    })
    try {
      var A = global.grindless.wirelessAdapters
      var deps = A.gtmDeps()
      var ok = deps.exact !== undefined
      var detail = ''
      values.forEach(function (digits) {
        var got = deps.exact(Long.parseLong(digits))
        detail += digits + '->' + got + ' '
        if (got !== digits) ok = false
      })
      emit('EXACT', ok ? 'PASS' : 'FAIL', detail)
    } catch (e) {
      emit('EXACT', 'FAIL', 'exception: ' + e)
    }
    console.info(TAG + 'DONE')
  })
})()
