import SortableList from "../2-sortable-list/indexSortable.js";
import escapeHtml from "./utils/escape-html.js";
import fetchJson from "./utils/fetch-json.js";

const IMGUR_CLIENT_ID = "28aaa2e823b03b1";
const BACKEND_URL = "https://course-js.javascript.ru";

// https://course-js.javascript.ru/api/rest/products

// TODO: реализовать загрузку формы
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

  constructor(productId) {
    this.productId = productId;
  }

  async render() {
    const categoriesData = this.loadCategories();

    const productPromise = this.productId
      ? this.loadProduct()
      : [this.defaultProductData];

    const [productResponce, categoriesResponce] = await Promise.all([
      productPromise,
      categoriesData,
    ]);

    const [productData] = productResponce;

    this.product = productData;
    this.categories = categoriesResponce;

    this.renderPage();

    if (this.product) {
      this.productCategoryOption();
      this.updateMainTemplate();
      this.imageContainer();
      this.initEventListeners();
    }
  }

  renderPage() {
    const div = document.createElement("div");
    div.innerHTML = this.template();
    this.element = div.firstElementChild;
    root.append(this.element);

    this.getSubElements();
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

  initEventListeners = () => {
    const { save, uploadImage } = this.subElements;

    uploadImage.addEventListener("click", this.callUpload);
    save.addEventListener("click", this.uploadFormDataOnServer);
  };

  //TODO: сделать отдельный объект для данной формы и отправляь его Json
  uploadFormDataOnServer = (event) => {
    event.preventDefault();
    const { productForm } = this.subElements;
    console.log(productForm);

    this.currentProduct = {
      // id,
    };
  };

  callUpload = (event) => {
    event.preventDefault();
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.click();

    input.addEventListener("change", () => {
      const [file] = input.files;
      const { name: source } = file;

      const imageData = new FormData();
      imageData.append("image", file);
      try {
        this.imageUploader(imageData, source);
      } catch (e) {
        console.log("error uploadImage: " + e.message);
      }
    });
  };

  async imageUploader(imageData, source) {
    const respond = await fetch("https://api.imgur.com/3/image", {
      method: "POST",
      headers: {
        Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
      },
      body: imageData,
      referrer: " ",
    });

    const { data } = await respond.json();
    this.imageLink = data.link;

    this.subElements["imageListContainer"].firstElementChild.append(
      this.imageTemplate(this.imageLink, source)
    );
  }

  updateMainTemplate() {
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

  // TODO: Реализовать newOption
  productCategoryOption() {
    const { subcategory } = this.subElements;
    const arrOfOptions = [];

    this.categories.map(({ subcategories, title }) => {
      subcategories.map((sub) => {
        arrOfOptions.push(new Option(`${title} > ${sub.title}`, sub.id));
      });
    });
    subcategory.append(...arrOfOptions);
  }

  imageContainer() {
    const { imageListContainer } = this.subElements;
    const arrOfImages = [];

    this.product.images.forEach(({ url, source }) => {
      arrOfImages.push(this.imageTemplate(url, source));
    });

    const sortableList = new SortableList(arrOfImages);
    imageListContainer.append(sortableList.element);
  }

  imageTemplate(url, source) {
    const div = document.createElement("div");

    div.innerHTML = `<li class="products-edit__imagelist-item sortable-list__item" style="">
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

    return div.firstElementChild;
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
}
