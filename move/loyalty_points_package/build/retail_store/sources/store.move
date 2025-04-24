
/// Module: loyalty_points
module retail_store::store {

use iota::token::{Self};
use iota::coin::{Self, TreasuryCap};
use iota::iota::IOTA;
use std::string::{String};

use retail_store::loyalty::{reward_user, LOYALTY};

const EInvalidProductType: u64 = 0;
const EIncorrectAmount: u64 = 1;


public enum ProductType has copy, drop, store {
    Laptop,
    Phone,
    Tablet,
}

public struct Product has key, store {
    id: UID,
    product_type: ProductType,
    price: u64,
}


public struct ManagerCap has key, store {
    id: UID,
    owner: address,
}

// Function to initialize the ManagerCap
fun init(ctx: &mut TxContext) {
    let manager_cap = ManagerCap { id: object::new(ctx), owner: tx_context::sender(ctx) };
    transfer::public_share_object(manager_cap);
}


entry fun buy_product_with_iota(product_type: String, payment: coin::Coin<IOTA>, manager_cap: &ManagerCap, loyalty_cap: &mut TreasuryCap<LOYALTY>,  ctx: &mut TxContext) {
    

    let mut default_type = ProductType::Laptop;
    let mut price = 0;
    let mut loyalty_amount = 0;

    if (product_type.as_bytes() == b"Laptop") {
        default_type = ProductType::Laptop;
        price = 1000;
        loyalty_amount = 100;
    } else if (product_type.as_bytes()  == b"Phone") {
        default_type = ProductType::Phone;
        price = 500;
        loyalty_amount = 50;
    } else if (product_type.as_bytes()  == b"Tablet") {
        default_type = ProductType::Tablet;
        price = 300;
        loyalty_amount = 30;
    } else {
        assert!(false, EInvalidProductType);
    };

    let amount = payment.value();
    assert!(amount >= price, EIncorrectAmount);

    let product = Product {
        id: object::new(ctx),
        product_type: default_type,
        price: price,
    };

    let owner = manager_cap.owner;
    transfer::public_transfer(payment, owner);
    
    transfer::transfer(product, ctx.sender());

    reward_user(loyalty_cap, loyalty_amount, ctx.sender(), ctx)

    
}


entry fun buy_product_with_loyalty(product_type: String, payment:token::Token<LOYALTY>, loyalty_cap: &mut TreasuryCap<LOYALTY>, ctx: &mut TxContext) {
    let mut default_type = ProductType::Laptop;
    let mut price = 0;

    if (product_type.as_bytes() == b"Laptop") {
        default_type = ProductType::Laptop;
        price = 1000;
    } else if (product_type.as_bytes()  == b"Phone") {
        default_type = ProductType::Phone;
        price = 500;
    } else if (product_type.as_bytes()  == b"Tablet") {
        default_type = ProductType::Tablet;
        price = 300;
    } else {
        assert!(false, EInvalidProductType);
    };

    let amount = payment.value();
    assert!(amount >= price, EIncorrectAmount);

    let product = Product {
        id: object::new(ctx),
        product_type: default_type,
        price: price,
    };

    transfer::transfer(product, ctx.sender());

    token::burn( loyalty_cap, payment)


}
}

