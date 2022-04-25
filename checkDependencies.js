const { version } = require('os');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const pjson = require('./package.json')

const julyTheFourth = (new Date('2022-02-23')).valueOf();

// console.log(pjson.dependencies);
const packagesBoth = [
  ...Object.keys(pjson.dependencies),
  ...Object.keys(pjson.devDependencies),
];
// console.log(packagesBoth);
const packagesUnique = new Set(packagesBoth);
const packages = [...packagesUnique]
  .map((pack) => ({
    package: pack,
    version: (pjson.dependencies[pack] || pjson.devDependencies[pack]).replace('^',''),
    unlock: (pjson.dependencies[pack] || pjson.devDependencies[pack]).includes('^'),
    versionFull: pjson.dependencies[pack] || pjson.devDependencies[pack]
  }))
  .filter((pack) => !pack.package.includes("@front") ) 

console.table(packages);

const checkNPM = async (arrPackages) => {
    for (let i = 0; i < arrPackages.length; i++) {
        const pack = arrPackages[i];
        const { stdout, stderr } = await exec(`npm view ${pack.package}@${pack.version} time -json`)
        const json = JSON.parse(stdout)
        pack.publish = new Date(json[pack.version]);
        pack.warning = pack.publish.valueOf() > julyTheFourth;
        pack.publish = pack.publish.toLocaleDateString()
        console.log(`${i + 1}/${arrPackages.length}\t:\t${pack.package}@${pack.versionFull}\t:\t${pack.publish}\t:\twarning: ${pack.warning}`);
        if (stderr?.length > 0) {
            console.log("stderr: " + stderr);
        }
    }
    return arrPackages;
 }   
checkNPM(packages)
.then(console.table);
