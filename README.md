# utils

### [checkDependencies](https://github.com/gurdjian/utils/blob/main/checkDependencies.js)

Скрипт умеет проверять все зависимости на залоченность версии и дергает из репозитария npm по каждому пакету из списка зависимостей дату публикации в репозитарии npm версии, указанной в зависимости. Для версий с "^" проверяется значение, указанные после "^".

Скрипт нужно положить в корень проекта и запустить "node checkDependencies.js"

Вывод в консоль выглядит следующим образом:

1. формируется список зависимостей dep+devDep

2. Поочередно для каждого пакета через npm-cli запрашивается дата публикации и сравнивается с эталонной константой 
const julyTheFourth = (new Date('2022-02-23')).valueOf();

>1/46 : @reduxjs/toolkit@1.7.2 : 03.02.2022 : warning: false
>
>2/46 : @types/node@17.0.17 : 10.02.2022 : warning: false
>
>3/46 : @types/react@17.0.39 : 03.02.2022 : warning: false
>
>...
>
>46/46 : webpack-merge@5.8.0 : 07.06.2021 : warning: false 

3. ИТОГОВАЯ ТАБЛИЦА

package - название пакета │ version - версия, которая запрашивается │ unlock - если true, то версия не фиксирована  │ versionFull - версия, указанные в package.json │ publish - дата публикации │ warning - true, если дата больше 23 февраля 2022г
<img width="652" alt="image" src="https://user-images.githubusercontent.com/87943036/165067101-5bc1b015-b2e2-40b1-a904-3d1345fcb5be.png">
