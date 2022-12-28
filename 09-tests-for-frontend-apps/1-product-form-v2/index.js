import SortableList from "../2-sortable-list/index.js";
import escapeHtml from "./utils/escape-html.js";
import fetchJson from "./utils/fetch-json.js";

const IMGUR_CLIENT_ID = "28aaa2e823b03b1";
const BACKEND_URL = "https://course-js.javascript.ru";

export default class ProductForm {
  subElements = {};

  defaultProductData = {
    title: "",
    description: "",
    quantity: 1,
    subcategory: "",
    status: 1,
    images: [],
    price: 0,
    discount: 0,
  };

  onUploadImageOnServer = (event) => {
    event.preventDefault();

    const input = this.createInputElement();
    input.click();

    input.addEventListener("change", () => {
      const [file] = input.files;
      const { name: source } = file;
      const imageData = new FormData();
      imageData.append("image", file);

      this.imageUploader(imageData, source);
    });

    input.remove();
  };

  onUploadProductOnServer = (event) => {
    event.preventDefault();
    this.preparingProductForUpload();
    this.productUploader();
  };

  onSaveNewProductValue = () => {
    const control = event.target.closest("[name]");
    if (!control) return;
    this.product[control.name] = control.value;
  };

  constructor(productId) {
    this.productId = productId;
  }

  async render() {
    const categoriesPromise = this.loadCategories();

    const productPromise = this.productId
      ? this.loadProduct()
      : [this.defaultProductData];

    const [productResponce, categoriesResponce] = await Promise.all([
      productPromise,
      categoriesPromise,
    ]);

    this.product = productResponce[0];
    this.categories = categoriesResponce;

    this.createElement();

    if (this.product) {
      this.renderProductsCategoryOptions();
      this.renderElementValues();
      this.createImagesSortableList();
      this.initEventListeners();
    }
  }

  createElement() {
    const div = document.createElement("div");
    div.innerHTML = this.getMainTemplate();
    this.element = div.firstElementChild;
    root.append(this.element);

    this.getSubElements();
  }

  createInputElement() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    return input;
  }

  createImagesSortableList() {
    const { imageListContainer } = this.subElements;
    const arrOfImages = [];

    this.product.images.forEach(({ url, source }) => {
      arrOfImages.push(this.getImageTemplate(url, source));
    });

    const sortableList = new SortableList(arrOfImages);
    imageListContainer.append(sortableList.element);
  }

  loadProduct() {
    return fetchJson(`${BACKEND_URL}/api/rest/products?id=${this.productId}`);
  }

  loadCategories() {
    return fetchJson(
      `${BACKEND_URL}/api/rest/categories?_sort=weight&_refs=subcategory`
    );
  }

  getSubElements() {
    this.subElements = {};
    const dataElement = document.querySelectorAll("[data-element]");

    for (let elem of dataElement) {
      this.subElements[elem.dataset.element] = elem;
    }
  }

  getImageTemplate(url, source) {
    const div = document.createElement("div");
    div.innerHTML = `<li class="products-edit__imagelist-item sortable-list__item" style="">
                        <input type="hidden" name="url" value="${escapeHtml(
                          url
                        )}"/>
                        <input type="hidden" name="source" value="${source}"/>
                        <span>
                          <img src="icon-grab.svg" data-grab-handle="" alt="grab" />
                          <img class="sortable-table__cell-img" alt="${escapeHtml(
                            source
                          )}" src="${escapeHtml(url)}"/>
                          <span>${escapeHtml(source)}</span>
                        </span>
                        <button type="button">
                          <img src="icon-trash.svg" data-delete-handle="" alt="delete"/>
                        </button>
                     </li>`;

    return div.firstElementChild;
  }

  getMainTemplate() {
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
                </div>
                <button type="button" name="uploadImage" data-element='uploadImage' class="button-primary-outline"><span>Загрузить</span></button>
              </div>

              <div class="form-group form-group__half_left">
                <label class="form-label">Категория</label>
                <select class="form-control" data-element='subcategory' name="subcategory">
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
                <button type="submit" name="save" data-element='save' class="button-primary-outline">
                  Добавить товар
                </button>
              </div>
            </form>
          </div>`;
  }

  initEventListeners = () => {
    const { uploadImage, productForm } = this.subElements;

    document.addEventListener("change", this.onSaveNewProductValue);
    uploadImage.addEventListener("click", this.onUploadImageOnServer);
    productForm.addEventListener("submit", this.onUploadProductOnServer);
  };

  renderElementValues() {
    const exeptions = ["images"];
    const fields = Object.keys(this.defaultProductData).filter(
      (key) => !exeptions.includes(key)
    );

    const { productForm, save } = this.subElements;

    fields.forEach((item) => {
      productForm[item].value = this.product[item];
    });

    if (this.productId) save.innerHTML = "Сохранить товар";
  }

  renderProductsCategoryOptions() {
    const arrOfOptions = [];

    this.categories.map(({ subcategories, title }) => {
      subcategories.map((sub) => {
        arrOfOptions.push(new Option(`${title} > ${sub.title}`, sub.id));
      });
    });

    const { subcategory } = this.subElements;
    subcategory.append(...arrOfOptions);
  }

  preparingProductForUpload() {
    const { imageListContainer } = this.subElements;

    this.product.images = [];

    [...imageListContainer.firstElementChild.children].forEach((element) => {
      const [urlInput, sourceInput] = element.querySelectorAll("[name]");
      const { value: url } = urlInput;
      const { value: source } = sourceInput;
      this.product.images.push({
        url,
        source,
      });
    });
  }

  productUploader() {
    return fetch(`${BACKEND_URL}/api/rest/products`, {
      method: this.productId ? "PATCH" : "PUT",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify(this.product),
    });
  }

  async imageUploader(imageData, source) {
    try {
      const result = await fetchJson("https://api.imgur.com/3/image", {
        method: "POST",
        headers: {
          Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
        },
        body: imageData,
        referrer: " ",
      });

      const { data } = result;

      this.subElements["imageListContainer"].firstElementChild.append(
        this.getImageTemplate(data.link, source)
      );
    } catch (error) {
      console.log("Something went wrong with upload Image: " + e.message);
    }
  }

  remove() {
    if (this.element) {
      this.element.remove();
      document.removeEventListener("change", this.changeProduct);
    }
  }

  destroy() {
    this.remove();
    this.subElements = null;
    this.defaultProductData = null;
  }
}
