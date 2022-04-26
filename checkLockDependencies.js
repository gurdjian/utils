const fs = require('fs')
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const packageLockFile = require('./package-lock.json')

const print = (result = []) => fs.appendFileSync('./report.txt', `${result.join('\n')}\n`)

// comment next line if you haven't inner or non-npm packages
const innerPackageName = '@kapun'
const deadline = new Date('2022-02-23').valueOf()

const deps = Object.keys(packageLockFile.dependencies)
const packages = deps
// comment next line if you haven't inner or non-npm packages
  .filter(name => !name.startsWith(innerPackageName))
  .map(pack => ({
    package: pack,
    version: packageLockFile.dependencies[pack].version,
  }))

const checkNPM = async (arrPackages) => {
  const warnPackages = []

  for (let i = 0, { length } = arrPackages; i < length; i++) {
    const pack = arrPackages[i]
    const { stdout, stderr } = await exec(`npm view ${pack.package}@${pack.version} time -json`)
    const json = JSON.parse(stdout)

    pack.publish = new Date(json[pack.version])
    pack.warning = pack.publish.valueOf() > deadline
    pack.publish = pack.publish.toLocaleDateString()

    const log = `${i + 1}/${length}\t:\t${pack.package}\t:\t${pack.version}\t:\t${pack.publish}`
    if (pack.warning) {
      warnPackages.push(`${pack.package} ${pack.version} ${pack.publish}`)
      console.log('\x1b[31m%s\x1b[0m', log)
    } else {
      console.log(log);
    }
    if (stderr?.length > 0) {
      console.log(`stderr: ${stderr}`)
    }
  }
  return warnPackages
}

checkNPM(packages).then((result) => {
  print(result)
  console.table(result)
})
