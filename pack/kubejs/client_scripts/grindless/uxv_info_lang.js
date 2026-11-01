// priority: 1564
// Gregtech Grindless - EMI information page of the UXV machine hull and the four UXV energy and dynamo hatches
// (kubejs/assets/emi/recipe/additions/grindless/uxv_machine_hull.json, type emi:info; recipes: server_scripts/grindless/uxv/foundation.js).
// Every key is in en_us.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('emi.grindless.info.uxv_machine_hull.0', "The UXV Machine Hull is the core that every UXV machine and hatch is built on: the energy and dynamo hatches start from one. It is made in the Assembly Line from the UXV machine casing, voltage coils, power dies, lasagna plates and sensors, after station research on the voltage coil.")
    add('emi.grindless.info.uxv_machine_hull.1', "The UXV Energy Hatches bring EU into a multiblock from a cable at UXV voltage: the plain one takes 2 A, the 16A one 16 A. The UXV Dynamo Hatches carry EU out of a generator multiblock: the plain one gives 2 A, the 16A one 16 A.")
    add('emi.grindless.info.uxv_machine_hull.2', "The four hatches are made in the Assembly Line from a UXV hull, pasta wire and lasagna plates, after station research on the hull. A UXV multiblock takes them in its energy slots in the bottom layer; on its own the hull does nothing.")
})

