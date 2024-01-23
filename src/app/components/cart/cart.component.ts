import { Component, Input, OnInit } from '@angular/core';
import { AddToCartPublisherService } from '../../services/add.to.cart.publisher.service';
import { Product } from '../../interfaces/product';
import { CommonModule } from '@angular/common';
import { CartOrderPageService } from '../../services/cart-order-page.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent implements OnInit {
  @Input() isOrderPage: boolean = false;

  cartProducts: Product[] = [];
  totalPrice: number = 0;

  constructor(
    private addToCartPublisherService: AddToCartPublisherService,
    private cartOrderPage: CartOrderPageService
  ) {}

  ngOnInit(): void {
    this.cartOrderPage.cart$.subscribe((cart: any) => {
      this.cartProducts = cart;
      this.calculateTotalPrice();
    });

    this.addToCartPublisherService
      .listenForProduct()
      .subscribe((product: Product) => {
        this.defineProductAction(product);
      });
  }

  private defineProductAction(product: Product) {
    let productIndex = this.findIndexOfProductInCart(product);
    if (productIndex >= 0) {
      let existingProduct = this.cartProducts[productIndex];
      existingProduct.count = product.count;
      if (existingProduct.count === 0) {
        this.cartProducts.splice(productIndex, 1);
      }
    } else {
      this.cartProducts.push(product);
    }
    this.calculateTotalPrice();

    // Update the service only after modifying the array
    this.cartOrderPage.updateCart(this.cartProducts);
  }

  private findIndexOfProductInCart(product: Product): number {
    return this.cartProducts.findIndex(
      (cartProduct) => cartProduct.id === product.id
    );
  }

  calculateTotalPrice() {
    let price = 0;
    for (let cartProduct of this.cartProducts) {
      if (cartProduct.count !== undefined) {
        price += cartProduct.price * cartProduct.count;
      }
    }

    // Round the total price to two decimal places
    this.totalPrice = Number(price.toFixed(2));
  }
}
