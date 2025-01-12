"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockSettings = exports.mockUser = exports.mockItems = void 0;
exports.mockItems = [
    {
        item_code: "ITEM-001",
        item_name: "Laptop",
        description: "High performance laptop",
        standard_rate: 999.99,
        current_stock: 10,
        barcode: "123456789",
        item_group: "Electronics"
    },
    {
        item_code: "ITEM-002",
        item_name: "Wireless Mouse",
        description: "Ergonomic wireless mouse",
        standard_rate: 29.99,
        current_stock: 50,
        barcode: "987654321",
        item_group: "Electronics"
    },
    {
        item_code: "ITEM-003",
        item_name: "USB-C Cable",
        description: "Fast charging USB-C cable",
        standard_rate: 19.99,
        current_stock: 100,
        barcode: "456789123",
        item_group: "Electronics"
    },
    {
        item_code: "ITEM-004",
        item_name: "Mechanical Keyboard",
        description: "RGB mechanical keyboard",
        standard_rate: 149.99,
        current_stock: 15,
        barcode: "789123456",
        item_group: "Electronics"
    },
    {
        item_code: "ITEM-005",
        item_name: "27\" Monitor",
        description: "4K LED Monitor",
        standard_rate: 299.99,
        current_stock: 8,
        barcode: "321654987",
        item_group: "Electronics"
    },
    {
        item_code: "WGT-001",
        item_name: "Premium Bananas",
        description: "Fresh bananas sold by weight",
        standard_rate: 1.500,
        current_stock: 100,
        barcode: "",
        item_group: "Weighed Items",
        scale_item_code: "2121",
        uom: "Kg"
    },
    {
        item_code: "WGT-002",
        item_name: "Local Tomatoes",
        description: "Fresh tomatoes sold by weight",
        standard_rate: 2.000,
        current_stock: 50,
        barcode: "",
        item_group: "Weighed Items",
        scale_item_code: "2122",
        uom: "Kg"
    },
    {
        item_code: "WGT-003",
        item_name: "American Apple",
        description: "Fresh apples sold by weight",
        standard_rate: 3.500,
        current_stock: 75,
        barcode: "",
        item_group: "Weighed Items",
        scale_item_code: "2123",
        uom: "Kg"
    }
];
exports.mockUser = {
    username: "testuser",
    password: "testpass123",
    role: "POS User",
};
exports.mockSettings = {
    currency: "KWD",
    currency_symbol: "KD",
    currency_precision: 3,
    currency_format: "#,###.###",
};
//# sourceMappingURL=mockData.js.map