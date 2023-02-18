const XLSX = require("xlsx");

class ExcelReader {
    static prices = []
    static mainArray = []

    constructor() {}

    static getPrices(filename) {
        const file = XLSX.readFile(filename)
        const sheet = file.Sheets['Цена']
        ExcelReader.prices = XLSX.utils.sheet_to_json(sheet)
    }

    static getData(filename) {
        const file = XLSX.readFile(filename)
        const sheets = file.SheetNames
        let data = new Map()
        for (let i = 1; i < sheets.length; i++) {
            const temp = XLSX.utils.sheet_to_json(
                file.Sheets[file.SheetNames[i]])
            data.set(temp, file.SheetNames[i])
        }
        ExcelReader.mainArray = data
    }

    async canBuy(candidates, params, wanted) {
        let sum = []
        for (let i = 0; i < params.length; i++) {
            sum[i] = wanted[i] - params[i]
        }
        let result = []
        let subList = []
        this._doNext(0, result, 0, candidates, sum[0], sum[1], sum[2], subList);
        result = this._sort(result)
        return result;
    }

    _doNext(
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
        ) {
            candidates.forEach((key, value) => {
                for (let j = i; j < value.length; j++) 
                {
                    subArr.push(new Map())
                    subArr[subArr.length - 1].set('type', key)
                    subArr[subArr.length - 1].set(0, value[j]['Сила'])
                    subArr[subArr.length - 1].set(1, value[j]['Стамина'])
                    subArr[subArr.length - 1].set(2, value[j]['Скорость'])              
                    this._doNext( 
                        j,
                        result, 
                        count + 1,
                        candidates,
                        target1 - value[j]['Сила'], 
                        target2 - value[j]['Стамина'], 
                        target3 - value[j]['Скорость'],
                        subArr
                    )
                    subArr.splice(subArr.length - 1, 1)
                }
            })
        }
        else if (target1 > 0 && target2 > 0 && target3 > 0 && count == 6)
        {
            return;
        }
    }

    _sort(unsorted) {
        unsorted = this._addPriceInUnsortedElements(unsorted)
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

    _addPriceInUnsortedElements(unsortedWithoutPrice) {
        for (let i = 0; i < unsortedWithoutPrice.length; i++) {
            let price = 0
            for (let j = 0; j < unsortedWithoutPrice[i].length; j++) {
                price += ExcelReader.prices[0][unsortedWithoutPrice[i][j].get('type')]
            }
            unsortedWithoutPrice[i]['price'] = price;
        }
        return unsortedWithoutPrice
    }
}

module.exports = ExcelReader