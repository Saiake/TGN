const XLSX = require("xlsx")
const { workerData, parentPort } = require('node:worker_threads')

function getPrices(filename) {
    const file = XLSX.readFile(filename)
    const sheet = file.Sheets['Цена']
    return XLSX.utils.sheet_to_json(sheet)
}

function getData(filename) {
    const file = XLSX.readFile(filename)
    const sheets = file.SheetNames
    let data = []
    for (let i = 1; i < sheets.length; i++) {
        const temp = XLSX.utils.sheet_to_json(
            file.Sheets[file.SheetNames[i]])
        for (let j = 0; j < temp.length; j++)
            temp[j].type = file.SheetNames[i]
        data = data.concat(temp)
    }
    return data
}

function canBuy(candidates, params, wanted) {
    let sum = []
    for (let i = 0; i < params.length; i++) {
        sum[i] = wanted[i] - params[i]
    }
    let result = []
    let subList = []
    _doNext(0, result, 0, candidates, sum[0], sum[1], sum[2], subList);
    result = _sort(result)
    return result
}

function _doNext(
    i,
    result,
    count,
    candidates,
    target1,
    target2,
    target3,
    subArr
) {
    if (target1 == 0 && target2 == 0 && target3 == 0) {
        let subList = []
        for (let k = 0; k < count; k++)
            subList.push(subArr[k])
        result.push(subList)
        
    }
    else if (
        (target1 > 0 && target2 == 0 && target3 == 0 && count < 6) 
    || (target1 == 0 && target2 > 0 && target3 == 0 && count < 6)
    || (target1 == 0 && target2 == 0 && target3 > 0 && count < 6)
    || (target1 > 0 && target2 > 0 && target3 > 0 && count < 6)
    || (target1 == 0 && target2 > 0 && target3 > 0 && count < 6)
    || (target1 > 0 && target2 == 0 && target3 > 0 && count < 6)
    || (target1 > 0 && target2 > 0 && target3 == 0 && count < 6)
    ) {
        for (let j = i; j < candidates.length; j++) {
            subArr.push(new Map())
            subArr[subArr.length - 1].set('type', candidates[j]['type'])
            subArr[subArr.length - 1].set(0, candidates[j]['Сила'])
            subArr[subArr.length - 1].set(1, candidates[j]['Стамина'])
            subArr[subArr.length - 1].set(2, candidates[j]['Скорость'])
            _doNext( 
                j,
                result, 
                count + 1,
                candidates,
                target1 - candidates[j]['Сила'], 
                target2 - candidates[j]['Стамина'], 
                target3 - candidates[j]['Скорость'],
                subArr
            )
            subArr.splice(subArr.length - 1, 1) 
        }
    }
    else if (target1 > 0 && target2 > 0 && target3 > 0 && count == 6)
    {
        return;
    }
}

function _sort(unsorted) {
    unsorted = _addPriceInUnsortedElements(unsorted)
    unsorted.sort(function (firstElement, secondElement) {
        if (firstElement['price'] > secondElement['price']) {
            return 1
        } 
        else if (firstElement['price'] < secondElement['price']) {
            return -1
        } 
        else if (firstElement['price'] == secondElement['price']) {
            return 0
        }
    })
    let j = 1;
    let resultCount = unsorted.length;
    while (j < resultCount) 
    {
        if (unsorted[j]['price'] == unsorted[j - 1]['price'])
        {
            unsorted.splice(j, 1);
            resultCount = unsorted.length;
            j = 0;
        }
        j++;
    }
    for (let i = 0; i < unsorted.length; i++) {
        if (!unsorted[i]['price'])
        unsorted.sort(function (firstElement, secondElement) {
            if (
                (firstElement['type'] == 'Legendary' && secondElement['type'] == 'Epic')
                || (firstElement['type'] == 'Legendary' && secondElement['type'] == 'Rare')
                || (firstElement['type'] == 'Legendary' && secondElement['type'] == 'Uncommon')
                || (firstElement['type'] == 'Legendary' && secondElement['type'] == 'Common')
                || (firstElement['type'] == 'Epic' && secondElement['type'] == 'Rare')
                || (firstElement['type'] == 'Epic' && secondElement['type'] == 'Uncommon')
                || (firstElement['type'] == 'Epic' && secondElement['type'] == 'Common')
                || (firstElement['type'] == 'Rare' && secondElement['type'] == 'Uncommon')
                || (firstElement['type'] == 'Rare' && secondElement['type'] == 'Common')
                || (firstElement['type'] == 'Uncommon' && secondElement['type'] == 'Common')
            )
                return 1
            else if (
                firstElement['type'] == secondElement['type']
            ) {
                return 0
            } else {
                return -1
            }
        })
    }
    return unsorted;
}

function _addPriceInUnsortedElements(unsortedWithoutPrice) {
    for (let i = 0; i < unsortedWithoutPrice.length; i++) {
        let price = 0
        for (let j = 0; j < unsortedWithoutPrice[i].length; j++) {
            price += prices[0][unsortedWithoutPrice[i][j].get('type')]
        }
        unsortedWithoutPrice[i]['price'] = price;
    }
    return unsortedWithoutPrice
}

const filename = './src/sales.xlsx'

const prices = getPrices(filename);
const mainArray = getData(filename);

const messageData = workerData
const result = canBuy(mainArray, messageData.params, messageData.wanted)
parentPort.postMessage({ result: result })
