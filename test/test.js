const {
    Product,
    CartItem,
    Customer,
    Order,
    discountEngine
} = require('./main for test');


function createOrder(
    items,
    customer,
    promoCode = null,
    deliveryCost = 300
) {
    return new Order(
        'test-order',
        customer,
        items,
        promoCode,
        new Date(),
        deliveryCost
    );
}


// 1. 3 по цене 2 + процент
// Количественная скидка применяется первой,
// процент считается от остатка

{
    const product1 = new Product(1, 'Товар 1', 1000, 'food');
    const product2 = new Product(2, 'Товар 2', 1000, 'food');
    const product3 = new Product(3, 'Товар 3', 3000, 'food');

    const items = [
        new CartItem(product1, 1),
        new CartItem(product2, 1),
        new CartItem(product3, 1)
    ];

    const customer = new Customer(
        'customer1',
        null,
        true
    );

    const order = createOrder(items, customer);

    console.log('Тест 1: 3 по цене 2 + процент');
    console.log(discountEngine(order));
}


// 2. 3 по цене 2 НЕ применяется
// Меньше трёх товаров

{
    const product1 = new Product(1, 'Товар 1', 1000, 'food');
    const product2 = new Product(2, 'Товар 2', 1000, 'food');

    const items = [
        new CartItem(product1, 1),
        new CartItem(product2, 1)
    ];

    const customer = new Customer(
        'customer2',
        null,
        false
    );

    const order = createOrder(items, customer);

    console.log('Тест 2: 3 по цене 2 не применяется');
    console.log(discountEngine(order));
}

// 3. СКИДКИ НЕ ПРИМЕНЯЮТСЯ. только процентная, так как она без условий


{
    const product1 = new Product(1, 'Товар 1', 1000, 'food');
    const product2 = new Product(2, 'Товар 2', 1000, 'food');

    const items = [
        new CartItem(product1, 1),
        new CartItem(product2, 1),
    ];

    const customer = new Customer(
        'customer1',
        null,
        false
    );

    const order = createOrder(items, customer);

    console.log('Тест 3: скидки с условиями не применяются');
    console.log(discountEngine(order));
}


// 4. Округление
// Значение ровно на половине копейки

{
    const product = new Product(
        1,
        'Товар',
        10.05,
        'food'
    );

    const items = [
        new CartItem(product, 1)
    ];

    const customer = new Customer(
        'customer5',
        null,
        false
    );

    const order = createOrder(items, customer);

    console.log('Тест 4: Half to even');
    console.log(discountEngine(order));
}


// 5. Лояльность
// Ровно 30 дней

{
    const lastPurchase = new Date(
        Date.now() - 30 * 24 * 60 * 60 * 1000
    );

    const customer = new Customer(
        'customer7',
        lastPurchase,
        false
    );

    const product = new Product(
        1,
        'Товар',
        2000,
        'food'
    );

    const items = [
        new CartItem(product, 1)
    ];

    const order = createOrder(items, customer);

    console.log('Тест 5: Лояльность — ровно 30 дней');
    console.log(discountEngine(order));
}


// 6. Лояльность НЕ применяется
// Покупка была больше 30 дней назад

{
    const lastPurchase = new Date(
        Date.now() - 31 * 24 * 60 * 60 * 1000
    );

    const customer = new Customer(
        'customer8',
        lastPurchase,
        false
    );

    const product = new Product(
        1,
        'Товар',
        2000,
        'food'
    );

    const items = [
        new CartItem(product, 1)
    ];

    const order = createOrder(items, customer);

    console.log('Тест 6: Лояльность не применяется');
    console.log(discountEngine(order));
}


// 7. неверный промокод

{
    const product = new Product(
        1,
        'Товар',
        3000,
        'food'
    );

    const items = [
        new CartItem(product, 1)
    ];

    const customer = new Customer(
        'customer9',
        null,
        false
    );

    const order = createOrder(
        items,
        customer,
        'NEW102' // должно быть ['NEW10', 'SEPTEMBER', 'DISCOUNT']
    );

    console.log('Тест 7: неверный промокод');
    console.log(discountEngine(order));
}

// 8. промокод поверх процентной скидки
{
    const product = new Product(
        1,
        'Товар',
        3001,
        'food'
    );

    const items = [
        new CartItem(product, 1)
    ];

    const customer = new Customer(
        'customer9',
        null,
        false
    );

    const order = createOrder(
        items,
        customer,
        'Procent'
    );

    console.log('Тест 8: промокод поверх процентной скидки');
    console.log(discountEngine(order));
}
