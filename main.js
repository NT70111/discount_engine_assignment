class Product {
    constructor(id, name, basePrice, category) {
        this.id = id;
        this.name = name;
        this.basePrice = basePrice;
        this.category = category;
    }
}

class CartItem {
    constructor(product, quantity) {
        this.product = product;
        this.quantity = quantity;
    }
}

class Customer {
    constructor(id, lastPurchaseDate, isFirstOrder) {
        this.id = id;
        this.lastPurchaseDate = lastPurchaseDate;
        this.isFirstOrder = isFirstOrder;
    }
}

class Order {
    constructor(id, customer, items, promoCode, createdAt, deliveryCost) {
        this.id = id;
        this.customer = customer;
        this.items = items;
        this.promoCode = promoCode;
        this.createdAt = createdAt;
        this.deliveryCost = deliveryCost;
    }
}

// ------------------------------------------------------------------

const phone = new Product(
    1,
    'iphone 21',
    550,
    'tech'
);

const phone2 = new Product(
    1,
    'iphone 21',
    1000,
    'tech'
);

const cartIteam1 = new CartItem(
    phone,
    3
);

const cartIteam2 = new CartItem(
    phone2,
    4
);



const customer1 = new Customer(
    'customer1',
    null,
    true
);

const order1 = new Order(
    "order1",
    customer1,
    [],
    "Procent",
    new Date(),
    300
);

order1.items.push(cartIteam1, cartIteam2);

// ---------------------------------------------------------------------------------------------

class Discount {
    constructor(discountName) {
        this.discountName = discountName
    }

    discountApply(order, currentTotal) {
        throw new Error('не найдена функция discountApply')
    }
}


function getTotal(order) {

    let total = 0;

    for (const item of order.items) {
        total += item.product.basePrice * item.quantity;
    }

    return total;
}

let appliedDiscounts = []
let baseTotal = getTotal(order1);
let finalTotal = getTotal(order1);

// -----------------------------------------------------------------------------------------------------


class discountProcent extends Discount {
    constructor(config) {
        super('процентная скидка')
        this.value = config.value
    }

    discountApply(order, currentTotal) {
        const orderPrice = currentTotal;
        return ((orderPrice / 100) * this.value)
    }
}


class discountFix extends Discount {
    constructor(config) {
        super('фикcированная скидка')
        this.value = config.value
    }

    discountApply(order, currentTotal) {
        const orderPrice = baseTotal;
        if (orderPrice >= 5000) {
            return this.value
        }
        else {
            return 0
        }
    }
}


class threeIteamsDiscount extends Discount {
    constructor(config) {
        super('3 по цене 2')
    }

    discountApply(order, currentTotal, car) {
        const orderPrice = currentTotal;

        const totalQuantity = order.items.reduce(
            (sum, item) => sum + item.quantity,
            0
        );

        if (totalQuantity < 3) {
            return 0;
        }


        const cheapestPrice = Math.min.apply(null,
            order.items.map(item => item.product.basePrice)
        );

        return cheapestPrice
    }
}

let actualFixPromocode = ['NEW10', 'SEPTEMBER', 'DISCOUNT']
let actualProcentPromocode = ['Procent']

class promocodeDiscount extends Discount {
    constructor(config) {
        super('скидка по промокоду')
        this.value = config.value
        this.valueProcent = config.valueProcent
    }

    discountApply(order, currentTotal) {
        const orderPrice = currentTotal;
        if (actualFixPromocode.includes(order.promoCode) && baseTotal >= 3000) {
            return this.value
        }
        else if (actualProcentPromocode.includes(order.promoCode) && baseTotal >= 3000) {
            return (orderPrice / 100) * this.valueProcent;
        }
        else {
            return 0;
        }
    }
}


class firstOrderDiscount extends Discount {
    constructor(config) {
        super('скидка на первый заказ')
        this.value = config.value
    }

    discountApply(order, currentTotal) {
        const orderPrice = currentTotal;

        if (order.customer.isFirstOrder === true) {
            return (orderPrice / 100) * this.value
        }
        else {
            return 0
        }
    }
}


class deliveryDiscount extends Discount {
    constructor(config) {
        super('скидка на доставку')
    }

    discountApply(order, currentTotal) {
        const orderPrice = baseTotal;

        if (orderPrice >= 5000) {
            return order.deliveryCost = 0;
        }
    }
}


class loyaltyDiscount extends Discount {
    constructor(config) {
        super('Лояльность')
        this.value = config.value
    }

    discountApply(order, currentTotal) {
        const orderPrice = currentTotal;
        if (order.customer.lastPurchaseDate === null) {
            return 0;
        }
        const daysPassed =
            (Date.now() - order.customer.lastPurchaseDate.getTime()) /
            (1000 * 60 * 60 * 24);
        if (daysPassed <= 30) {
            return (orderPrice / 100) * this.value
        }
        return 0;

    }
}
// -----------------------------------------------------------------------------------------------

class DiscountFactory {
    static create(config, order) {
        switch (config.type) {
            case 'fixed':
                return new discountFix(config);
            case 'threeForTwo':
                return new threeIteamsDiscount(config);
            case 'promo&procent':
                if (actualProcentPromocode.includes(order.promoCode)) {
                    if (config.valueProcent >= config.percentValue) {
                        return new promocodeDiscount(config);
                    }
                }
                return new discountProcent({
                    value: config.percentValue
                });
            case 'firstOrder':
                return new firstOrderDiscount(config);
            case 'freeDelivery':
                return new deliveryDiscount(config);
            case 'loyalty':
                return new loyaltyDiscount(config);
            default:
                throw new Error(
                    'Неизвестный тип скидки: ' + config.type
                );
        }
    }
}


const discountConfig = [
    { type: 'threeForTwo' },
    {
        type: 'promo&procent',
        value: 500,
        valueProcent: 15,
        percentValue: 10
    },
    { type: 'firstOrder', value: 10 },
    { type: 'loyalty', value: 5 },
    { type: 'fixed', value: 500 },
    { type: 'freeDelivery' }
];




function bankersRound(n, d = 2) {
    var x = n * Math.pow(10, d);
    var r = Math.round(x);
    var br = Math.abs(x) % 1 === 0.5 ? (r % 2 === 0 ? r : r - 1) : r;
    return br / Math.pow(10, d);
}


function discountEngine(order) {
    const discounts = discountConfig.map(config =>
        DiscountFactory.create(config, order)
    );
    for (const discount of discounts) {
        const discountValue = bankersRound(discount.discountApply(order, finalTotal));
        if (discountValue > 0) {
            appliedDiscounts.push({
                name: discount.discountName,
                amount: discountValue,
            });
            finalTotal = bankersRound(finalTotal - discountValue);
        }
    }
    finalTotal = finalTotal + order.deliveryCost
    return console.log(
        `финальная стоимость: ${finalTotal} стоимость доставки: ${order.deliveryCost}`,
        appliedDiscounts),
        console.log(`стоимость без скидки: ${baseTotal}`),
        order.customer.lastPurchaseDate = new Date();

}

discountEngine(order1)

console.log(`дата заказа ${customer1.lastPurchaseDate}`)
