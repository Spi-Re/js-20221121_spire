const BACKEND_URL = "https://course-js.javascript.ru";

export default class ColumnChart {
  subElement = {};

  chartHeight = 50;

  constructor({
    data = [],
    label = "",
    value = 0,
    link = "",
    url = "",
    formatHeading = (data) => data,
  } = {}) {
    this.data = data;
    this.label = label;
    this.link = link;
    this.url = url;
    this.formatHeading = formatHeading;
    this.value = formatHeading(value.toLocaleString("en-EN"));

    this.render();
  }

  getColumnProps() {
    if (!this.data.length) return [];

    if (this.element) {
      this.element.classList.remove("column-chart_loading");
    }

    const maxValue = Math.max(...this.data);
    const scale = this.chartHeight / maxValue;

    return this.data
      .map((item) => {
        const percent = ((item / maxValue) * 100).toFixed(0);
        const value = String(Math.floor(item * scale));
        return `<div style="--value: ${value}" data-tooltip="${percent}%"></div>`;
      })
      .join("");
  }

  getTemplate() {
    return `
        <div class="column-chart column-chart_loading" style="--chart-height: ${
          this.chartHeight
        }">
          <div class="column-chart__title">
            Total ${this.label}
            <a href="${this.link}" class="column-chart__link">View all</a>
          </div>
          <div class="column-chart__container">
            <div data-element="header" class="column-chart__header">${
              this.value
            }</div>
            <div data-element="body" class="column-chart__chart">
              ${this.getColumnProps()}
            </div>
          </div>
        </div>
    `;
  }

  render() {
    const element = document.createElement("div");
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;

    this.subElements = this.getSubElements();

    this.from = new Date(new Date().setMonth(new Date().getMonth() - 1));
    this.to = new Date();
    this.update(this.from, this.to);

    if (this.data.length) {
      this.element.classList.remove("column-chart_loading");
    }
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll("[data-element]");

    for (const element of elements) {
      result[element.dataset.element] = element;
    }
    return result;
  }

  async update(from, to) {
    const url = new URL(this.url, BACKEND_URL);
    url.searchParams.set("from", from);
    url.searchParams.set("to", to);
    const result = await this.loadData(url);

    if (!Object.values(result).length) return;

    this.data = Object.values(result);
    this.value = Object.values(result).reduce((a, b) => a + b);

    const { body, header } = this.subElements;
    body.innerHTML = this.getColumnProps();
    header.innerHTML = this.formatHeading(this.value.toLocaleString("en-EN"));
  }

  // FIXME: Если массив пустой, показывать 0
  // если ещё грузится ==== класс loading
  async loadData(url) {
    this.element.classList.toggle("column-chart_loading");
    const respond = await fetch(url);
    this.element.classList.toggle("column-chart_loading");

    return await respond.json();
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }
}
