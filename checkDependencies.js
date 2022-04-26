const fs = require("fs")
const util = require("util")
const exec = util.promisify(require("child_process").exec)
const pjson = require("../package.json")

const print = (result = []) => fs.appendFileSync('./report.txt', `—————\n${result.join('\n')}\n`)

// uncomment next line and change the name if you have inner or non-npm packages
// const innerPackageName = '@name'
const julyTheFourth = new Date("2022-02-23").valueOf()

const formatPackageInfo = (names, isDevDep) =>
  names
// uncomment next line if you have inner or non-npm packages
//    .filter((name) => !name.startsWith(innerPackageName))
    .map((name) => {
      const versionFull = pjson[isDevDep ? "devDependencies" : "dependencies"][name]
      const isUnlock = versionFull.startsWith("^")
      const version = isUnlock ? versionFull.slice(1) : versionFull
      return {
        name,
        isUnlock,
        version,
        versionFull
      }
    })

const depPackages = formatPackageInfo(Object.keys(pjson.dependencies))
const devDepPackages = formatPackageInfo(Object.keys(pjson.devDependencies), true)

const checkNPM = async (packages) => {
  const warnPackages = []

  for (let i = 0, { length } = packages; i < length; i += 1) {
    const pack = packages[i]
    const { stdout, stderr } = await exec(`npm view ${pack.name} time -json`)
    const json = JSON.parse(stdout)

    pack.publish = new Date(json[pack.version])
    pack.warning = pack.publish.valueOf() > julyTheFourth
    pack.publish = pack.publish.toLocaleDateString()

    const log = `${i + 1}/${length}\t:\t${pack.name}\t:\t${pack.version}\t:\t${pack.publish}`
    if (pack.warning) {
      warnPackages.push(`${pack.name} ${pack.version} ${pack.publish}`)
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

const output = (result) => {
    print(result)
    console.table(result)
}

checkNPM(depPackages).then(output)
checkNPM(devDepPackages).then(output)
