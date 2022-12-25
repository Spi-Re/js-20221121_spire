import SortableList from "../2-sortable-list/index.js";
import escapeHtml from "./utils/escape-html.js";
import fetchJson from "./utils/fetch-json.js";

const IMGUR_CLIENT_ID = "28aaa2e823b03b1";
const BACKEND_URL = "https://course-js.javascript.ru";

// TODO: Реализовать загрузку картики
// TODO: реализовать загрузку
export default class ProductForm {
  constructor(productId) {
    this.productId = productId;
  }

  async render() {
    const categoriesData = this.getCategories();

    const productPromise = this.productId
      ? this.getProduct()
      : Promise.resolve(false);

    const [product, categories] = await Promise.all([
      productPromise,
      categoriesData,
    ]);

    this.product = product ? product[0] : null;
    this.categories = categories;

    const div = document.createElement("div");
    div.innerHTML = this.template();
    this.element = div.firstElementChild;
    root.append(this.element);

    if (this.product) {
      this.update();
    }
    this.imageContainer();
    this.initEventListener();
  }

  getProduct() {
    const productURL = `${BACKEND_URL}/api/rest/products?id=${this.productId}`;
    const product = fetchJson(productURL);

    return product;
  }

  getCategories() {
    return fetchJson(
      `${BACKEND_URL}/api/rest/categories?_sort=weight&_refs=subcategory`
    );
  }

  initEventListener = () => {
    const [productForm] = document.forms;
    const { uploadImage: button } = productForm;
    button.addEventListener("click", (event) => {
      this.callUpload();
    });
  };

  callUpload() {
    const input = document.createElement("input");
    input.type = "file";
    input.click();
    input.addEventListener("change", (event) => {
      console.log(input.files[0]);
    });
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

  // TODO: Реализовать newOption
  productCategoryOption(category, categoryTitle) {
    const { subcategories } = category;
    return subcategories.map((sub) => {
      console.log(escapeHtml(">"));
      // new Object возвращает объект, для его использования нужно поменять подход.
      // new Option(`${categoryTitle} ${escapeHtml(">")} ${sub.title}`, `${sub.id}`;
      return `<option value="${sub.id}">${categoryTitle} ${escapeHtml(">")} ${
        sub.title
      }</option>`;
    });
  }

  imageContainer() {
    const arrOfImages = [];

    this.product.images.map(({ url, source }) => {
      const item = document.createElement("li");
      item.innerHTML = `<li class="products-edit__imagelist-item sortable-list__item" style="">
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
                        </li>`;
      arrOfImages.push(item.firstChild);
    });

    const imageContainer = document.querySelector(
      "[data-element='imageListContainer']"
    );
    imageContainer.append(new SortableList(arrOfImages).element);
  }

  template() {
    return `
          <div class="product-form">
            <form data-element="productForm" class="form-grid">

              <div class="form-group form-group__half_left">
                <fieldset>
                  <label class="form-label">Название товара</label>
                  <input
                    required=""
                    type="text"
                    name="title"
                    class="form-control"
                    placeholder="Название товара"
                  />
                </fieldset>
              </div>

              <div class="form-group form-group__wide">
                <label class="form-label">Описание</label>
                <textarea
                  required=""
                  class="form-control"
                  name="description"
                  data-element="productDescription"
                  placeholder="Описание товара"
                ></textarea>
              </div>

              <div class="form-group form-group__wide" data-element="sortable-list-container">
                <label class="form-label">Фото</label>
                <div data-element="imageListContainer">
                <ul class="sortable-list">
                </ul>
                </div>
                <button type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
              </div>

              <div class="form-group form-group__half_left">
                <label class="form-label">Категория</label>
                <select class="form-control" name="subcategory">
                  ${this.categories.map((category) => {
                    return this.productCategoryOption(category, category.title);
                  })}
                </select>
              </div>
                
              <div class="form-group form-group__half_left form-group__two-col">
                <fieldset>
                  <label class="form-label">Цена ($)</label>
                  <input required="" type="number" name="price" class="form-control" placeholder="100">
                </fieldset>
                <fieldset>
                  <label class="form-label">Скидка ($)</label>
                  <input required="" type="number" name="discount" class="form-control" placeholder="0">
                </fieldset>
              </div>
                
              <div class="form-group form-group__part-half">
                <label class="form-label">Количество</label>
                <input required="" type="number" class="form-control" name="quantity" placeholder="1">
              </div>

              <div class="form-group form-group__part-half">
                <label class="form-label">Статус</label>
                <select class="form-control" name="status">
                  <option value="1">Активен</option>
                  <option value="0">Неактивен</option>
                </select>
              </div>
                
              <div class="form-buttons">
                <button type="submit" name="save" class="button-primary-outline">
                  Сохранить товар
                </button>
              </div>
            </form>
          </div>`;
  }
}
