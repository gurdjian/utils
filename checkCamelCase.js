const fs = require('fs')
const camelCase = require('camelcase')
const pathPacket = require( "path" );
const replacesObj = {
    "Address": { // например, объекты АПИ
      "area_code": 4,
      "area_type": 4,
      "block_type": 5,
      "city_code": 4,
      "city_district": 4,
      "city_district_code": 4,
      "city_district_type": 4,
      "city_type": 4,
      "fias_id": 4,
      "flat_type": 4,
      "house_type": 5,
      "ignore_street": 6,
      "kladr_id": 5,
      "postal_code": 6,
      "region_code": 6,
      "region_type": 6,
      "settlement_type": 10,
      "street_code": 6,
      "street_type": 6
    }
  }
const replacesArr = Object.values(replacesObj)
                    .reduce((prev, curr) => {
                        return [...prev, ...Object.keys(curr)]
                    },[])
                    .sort();
const replaces =  new Set(replacesArr)
console.log(replacesArr.length,replaces.size);
console.log(replaces);
const paths = ['./src']
const ignore = ['.DS_Store']
function recursiveSearch(folder, paths) {
    paths.forEach(path => {
        
        if (path.isDirectory()) {
            fs.readdir(pathPacket.resolve( folder,  path.name ), {withFileTypes: true}, (err, files) => {
                if (err) {
                    console.log('readdir', pathPacket.resolve( folder,  path.name ), err );
                    return;
                }
                recursiveSearch(pathPacket.resolve( folder,  path.name ), files)
            })
        } else {
            searchText(pathPacket.resolve( folder,  path.name ))
        }
        // console.log(`${path.isDirectory() ? 'directory' : 'file'}: \t${pathPacket.resolve( folder,  path.name)}` );
    })
}

function searchText(pathToFile) {
    if (ignore.includes(pathPacket.basename(pathToFile)) ) {
        console.log('============  ignore ', pathPacket.basename(pathToFile), ignore.includes(pathPacket.basename(pathToFile)));
        return;
    };
    fs.readFile(pathToFile, 'utf8', function (err, data) {
        if (err) {
            console.log('readFile', pathToFile, err );
            return;
        }
        const relPath = pathPacket.relative('/Users/evgiurdzhiian/Documents/domclick/mortgage-agreement-front/', pathToFile)
        replaces.forEach( elem => {
          if(data.includes(elem)){
              console.log(pathPacket.extname(pathToFile).includes('scss'), `\t`, camelCase(elem), `\t`, relPath, `\t`, elem);
              if (camelCase(elem) !== elem) data = data.replaceAll(elem, camelCase(elem));
          }
        })
        if (!pathPacket.extname(pathToFile).includes('scss')) {  // найденные в стилях названия классов могут встречаться и в скриптах. Поэтому искать в стилях надо, а менять нет
          fs.writeFile(pathToFile,data, (err) => {
            if (err) console.log(relPath, '\terror =', err);
          });
        } 
      });
}

paths.forEach(path => {
     fs.stat(path, (err, stats) => {
        // console.log(`path: ${path} is ${stats.isDirectory() ? 'directory' : 'file'}`) ;
        if (!err) {
            if (stats.isDirectory()) {
                fs.readdir(path, {withFileTypes: true}, (err, files) => {
                    if (err) {
                        console.log('readdir', path, err );
                        return;
                    }
                    recursiveSearch(path, files)
                })
            } else {
                searchText(path)
            }
        }
     },)

})
