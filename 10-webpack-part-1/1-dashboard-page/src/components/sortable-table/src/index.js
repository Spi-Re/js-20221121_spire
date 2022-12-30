// import fetchJson from "./utils/fetch-json.js";
import fetchJson from "../../../utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru";

export default class SortableTable {
  step = 30;
  firstIndex = 0;
  lastIndex = this.firstIndex + this.step;

  sortBy = {
    id: false,
    order: "asc",
    type: "",
  };

  constructor(headerConfig, { data = [], sorted = {}, url = "" } = {}) {
    this.data = data;
    this.url = url;
    this.headerConfig = headerConfig;
    this.sorted = sorted;

    this.isSortOnClient =
      Object.hasOwn(sorted, "id") && Object.hasOwn(sorted, "order");

    this.render();
    this.requestOnServer();
  }

  render() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = this.getProductsContainer();
    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements();
    this.onChangeSortOrderEvent();
    this.initEventListeners();
  }

  initEventListeners = () => {
    document.addEventListener("scroll", this.onLoadScroll);
  };

  getSubElements() {
    const obj = {};
    const elems = this.element.querySelectorAll("[data-element]");

    for (const item of elems) {
      const name = item.dataset.element;
      obj[name] = item;
    }
    return obj;
  }

  getProductsContainer() {
    return `<div 
              data-element="productsContainer" 
              class="products-list__container">
              <div class="sortable-table">
                  ${this.getHeaderTemplate()}
                  ${this.getBodyTemplate()}
              </div>
            </div>`;
  }

  getHeaderTemplate() {
    return `<div
              data-element="header"
              class="sortable-table__header sortable-table__row"
            >
              ${this.getHeaderTemplateRow()}
            </div>`;
  }

  getHeaderTemplateRow() {
    return `${this.headerConfig
      .map((cell) => {
        return `<div class="sortable-table__cell"
                  data-id="${cell.id}"
                  data-sortable="${cell.sortable}"
                  ${
                    cell.sortable
                      ? `data-order="${
                          this.sorted.order ? this.sorted.order : `asc`
                        }"`
                      : ""
                  }  
                >
                  <span>${cell.title}</span>
                </div>`;
      })
      .join("")}`;
  }

  getBodyTemplate() {
    return `<div 
              data-element="body" 
              class="sortable-table__body">
              ${this.getBodyTemplateRow()}
            </div>`;
  }

  getBodyTemplateRow() {
    //TODO: элемент загрузки
    if (!this.data.length) return "";
    if (this.data === "empty") return "По вашему запросу нет данных";

    const headerConfig = Object.values(this.headerConfig);
    return this.getSort()
      .map((product) => {
        return `<a href="/products/${product.id}" class="sortable-table__row">
                    ${headerConfig
                      .map((item) => {
                        if (item.hasOwnProperty("template")) {
                          return item.template(product[item.id]);
                        }
                        return `<div class="sortable-table__cell">${
                          product[item.id]
                        }</div>`;
                      })
                      .join("")}
                </a>`;
      })
      .join("");
  }

  getSort(id = this.sorted.id, order = this.sorted.order) {
    if (!this.data.length) return;
    if (!this.isSortOnClient) return this.data;
    const arrCopy = [...this.data];
    let type = this.headerConfig.filter((cell) => cell.id === id)[0].sortType;

    if (Object.values(this.sortBy)[0]) {
      id = this.sortBy.id;
      order = this.sortBy.order;
      type = this.sortBy.type;
    }

    const direction = {
      asc: 1,
      desc: -1,
    };

    this.wasSorting = false;

    return arrCopy.sort((a, b) => {
      const first = a[id];
      const second = b[id];

      if (type === "string") {
        return (
          direction[order] *
          first.localeCompare(second, ["ru", "en"], {
            caseFirst: "upper",
          })
        );
      }

      return direction[order] * (first - second);
    });
  }

  showArrowAfterTarget(wrapper, event) {
    const arrows = this.subElements.header.querySelectorAll(
      ".sortable-table__sort-arrow"
    );
    Array.from(arrows).forEach((item) => item.remove());

    wrapper.innerHTML = this.showSortArrow();
    event.target.after(wrapper.firstElementChild);
    wrapper.remove();
  }

  onChangeSortOrderEvent() {
    const { header } = this.subElements;
    const that = this;
    let div = document.createElement("div");

    header.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      const headerCell = event.target.parentElement.dataset;
      if (!headerCell.id) return;
      if (headerCell.sortable === "false") return;

      this.showArrowAfterTarget(div, event);

      headerCell.order =
        headerCell.order === "asc"
          ? (headerCell.order = "desc")
          : (headerCell.order = "asc");

      this.sortBy = {
        id: headerCell.id,
        order: headerCell.order,
        get type() {
          return that.headerConfig.filter((cell) => cell.id === this.id)[0]
            .sortType;
        },
      };

      this.firstIndex = 0;
      this.lastIndex = 30;
      this.wasSorting = true;

      this.isSortOnClient ? this.update() : this.requestOnServer();
    });
  }

  onLoadScroll = (event) => {
    const { body } = this.subElements;
    const { bottom } = body.getBoundingClientRect();
    const viewHeight = document.documentElement.clientHeight;
    const scrollBottomLine = bottom - viewHeight;

    if (scrollBottomLine < 0) {
      this.firstIndex += this.step;
      this.lastIndex += this.step;
      this.requestOnServer();
      document.documentElement.scrollTop -= 50;
    }
  };

  get urlRequest() {
    console.log(this.firstIndex);
    const { id, order } = this.sortBy;
    const defaultId = this.headerConfig.find((item) => item.sortable).id;

    const url = new URL(this.url, BACKEND_URL);
    url.searchParams.set("_start", this.firstIndex);
    url.searchParams.set("_end", this.lastIndex);
    url.searchParams.set("_sort", id || defaultId);
    url.searchParams.set("_order", order);

    if (this.isSortOnClient) {
      url.searchParams.delete("_sort");
      url.searchParams.delete("_order");
      return url;
    }
    return url;
  }

  async requestOnServer() {
    const result = await fetchJson(this.urlRequest);
    this.data = result.length ? result : "empty";
    this.update();

    if (!this.wasSorting) {
    }
    this.wasSorting = false;
  }

  update() {
    this.wasSorting
      ? (this.subElements.body.innerHTML = this.getBodyTemplateRow())
      : this.subElements.body.insertAdjacentHTML(
          "beforeend",
          this.getBodyTemplateRow()
        );
  }

  showSortArrow() {
    return `<span class="sortable-table__sort-arrow">
              <span class="sort-arrow"></span>
            </span>`;
  }

  remove() {
    if (this.element) {
      this.element.remove();
      document.removeEventListeners("scroll", this.onLoadScroll);
    }
  }

  destroy() {
    if (this.element) {
      this.remove();
      this.subElements = null;
    }
  }
}
