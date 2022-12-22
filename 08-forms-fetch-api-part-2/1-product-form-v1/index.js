const IMGUR_CLIENT_ID = "28aaa2e823b03b1";
const BACKEND_URL = "https://course-js.javascript.ru";

export default class ProductForm {
  product = null;

  constructor(productId) {
    this.productId = productId;
  }

  async render() {
    if (this.productId) {
      await this.getProduct();
    }
    await this.getCategories();
    const root = document.getElementById("root");
    const div = document.createElement("div");
    div.innerHTML = this.productForm();
    this.element = div;

    root.append(this.element);

    this.listeners();

    if (this.product) {
      this.update();
    }
  }

  async getProduct() {
    const url = new URL("products", `${BACKEND_URL}/api/rest/`);
    url.searchParams.set("id", this.productId);

    const respond = await fetch(url);
    const result = await respond.json();
    this.product = result[0];
  }

  async getCategories() {
    const url = new URL("categories", `${BACKEND_URL}/api/rest/`);
    url.searchParams.set("_sort", "weight");
    url.searchParams.set("_refs", "subcategory");

    const respond = await fetch(url);
    this.categories = await respond.json();
  }

  update() {
    const {
      title,
      description,
      price,
      discount,
      quantity,
      status,
      subcategory,
    } = this.product;

    const mainForm = document.forms[0];
    mainForm.title.value = title;
    mainForm.description.value = description;
    mainForm.price.value = price;
    mainForm.discount.value = discount;
    mainForm.quantity.value = quantity;
    mainForm.status.value = status;
    mainForm.subcategory.value = subcategory;
    mainForm.save.innerHTML = "Сохранить товар";
  }

  productForm() {
    return `<div class="product-form">
              <form data-element="productForm" class="form-grid">
                ${this.productTitle()}
                ${this.productDiscription()}
                ${this.productPhoto()}
                ${this.productCategory()}
                ${this.productValue()}
                ${this.productQuantity()}
                ${this.productStatus()}
                ${this.productSaveButton()}
              </form>
            </div>`;
  }

  productTitle() {
    return `<div class="form-group form-group__half_left">
              <fieldset>
                <label class="form-label">Название товара</label>
                <input required="" type="text" name="title" class="form-control" placeholder="Название товара">
              </fieldset>
            </div>`;
  }

  productDiscription() {
    return `<div class="form-group form-group__wide">
              <label class="form-label">Описание</label>
              <textarea required="" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
            </div>`;
  }

  imageContainer(image) {
    const { url, source } = image;

    return `<div data-element="imageListContainer">
              <ul class="sortable-list">
              <li class="products-edit__imagelist-item sortable-list__item" style="">
                  <input type="hidden" name="url" value="${url}"/>
                  <input type="hidden" name="source" value="${source}"/>
                  <span>
                    <img src="icon-grab.svg" data-grab-handle="" alt="grab" />
                    <img class="sortable-table__cell-img" alt="Image" src="${url}"/>
                    <span>${source}</span>
                  </span>
                  <button type="button">
                    <img src="icon-trash.svg" data-delete-handle="" alt="delete"/>
                  </button>
                </li>
              </ul>
            </div>`;
  }

  productPhoto() {
    return `<div class="form-group form-group__wide" data-element="sortable-list-container">
              <label class="form-label">Фото</label>
              ${
                this.product
                  ? this.product.images
                      .map((image) => {
                        return this.imageContainer(image);
                      })
                      .join("")
                  : ""
              }
              <button type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
            </div>`;
  }

  productCategoryOption(category, categoryTitle) {
    const { subcategories } = category;
    return subcategories.map((sub) => {
      // new Object возвращает объект, для его использования нужно поменять подход.
      // new Option(`${categoryTitle} > ${sub.title}`, `${sub.id}`;
      return `<option value="${sub.id}">${categoryTitle} &gt; ${sub.title}</option>`;
    });
  }

  productCategory() {
    return `<div class="form-group form-group__half_left">
    <label class="form-label">Категория</label>
    <select class="form-control" name="subcategory">
      ${this.categories.map((category) => {
        return this.productCategoryOption(category, category.title);
      })}
    </select>
  </div>`;
  }

  productValue() {
    return `<div class="form-group form-group__half_left form-group__two-col">
              <fieldset>
                <label class="form-label">Цена ($)</label>
                <input required="" type="number" name="price" class="form-control" placeholder="100">
              </fieldset>
              <fieldset>
                <label class="form-label">Скидка ($)</label>
                <input required="" type="number" name="discount" class="form-control" placeholder="0">
              </fieldset>
            </div>`;
  }

  productQuantity() {
    return `<div class="form-group form-group__part-half">
              <label class="form-label">Количество</label>
              <input required="" type="number" class="form-control" name="quantity" placeholder="1">
            </div>`;
  }

  productStatus() {
    return `<div class="form-group form-group__part-half">
              <label class="form-label">Статус</label>
              <select class="form-control" name="status">
                <option value="1">Активен</option>
                <option value="0">Неактивен</option>
              </select>
            </div>`;
  }

  listeners() {
    const button = document.querySelector("[name='save']");

    button.addEventListener("product-saved", function () {
      // console.log("saved");
    });
    button.addEventListener("product-updated", function () {
      // console.log("update");
    });

    button.addEventListener("click", (event) => {
      event.preventDefault();

      this.productId
        ? button.dispatchEvent(new CustomEvent("product-updated"))
        : button.dispatchEvent(new CustomEvent("product-saved"));
    });
  }

  productSaveButton() {
    return `<div class="form-buttons">
              <button type="submit" name="save" class="button-primary-outline">
                Добавить товар
              </button>
            </div>`;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destriy() {
    this.remove();
  }
}
