import RangePicker from "./components/range-picker/src/index.js";
import SortableTable from "./components/sortable-table/src/index.js";
import ColumnChart from "./components/column-chart/src/index.js";

import header from "./bestsellers-header.js";

import fetchJson from "./utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru/";

export default class Page {
  subElements = {};

  template() {
    return `<div class="dashboard">
              <div class="content__top-panel">
                <h2 class="page-title">Dashboard</h2>
                <!-- RangePicker component -->
                <div data-element="rangePicker"></div>
              </div>
              <div data-element="chartsRoot" class="dashboard__charts">
                <!-- column-chart components -->
                <div data-element="ordersChart" class="dashboard__chart_orders"></div>
                <div data-element="salesChart" class="dashboard__chart_sales"></div>
                <div data-element="customersChart" class="dashboard__chart_customers"></div>
              </div>
              <h3 class="block-title">Best sellers</h3>
              <div data-element="sortableTable">
                <!-- sortable-table component -->
              </div>
            </div>`;
  }

  render() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = this.template();
    this.element = wrapper.firstElementChild;

    this.getSubElements();

    this.initComponents();
    this.renderComponents();
    this.initEventListeners();

    return this.element;
  }

  getSubElements = () => {
    const elements = this.element.querySelectorAll("[data-element]");
    for (const element of elements) {
      this.subElements[element.dataset.element] = element;
    }
  };

  renderComponents() {
    const components = Object.keys(this.components);
    components.forEach((componentName) => {
      const root = this.subElements[componentName];

      const { element } = this.components[componentName];
      root.append(element);
    });
  }

  loadData() {}

  initComponents() {
    const now = new Date();
    const from = new Date(now.setMonth(now.getMonth() - 1));
    const to = new Date();

    const rangePicker = new RangePicker({ from, to });

    const ordersChart = new ColumnChart({
      data: [],
      value: 0,
      link: "#",
      label: "orders",
      url: "/api/dashboard/orders",
    });

    const salesChart = new ColumnChart({
      data: [],
      value: 0,
      link: "#",
      label: "sales",
      formatHeading: (data) => `$${data}`,
      url: "/api/dashboard/sales",
    });

    const customersChart = new ColumnChart({
      data: [],
      value: 0,
      link: "#",
      label: "customers",
      url: "/api/dashboard/customers",
    });

    const sortableTable = new SortableTable(header, {
      from,
      to,
      url: `api/dashboard/bestsellers`,
    });

    this.components = {
      rangePicker,
      ordersChart,
      salesChart,
      customersChart,
      sortableTable,
    };
  }

  onChangeDate = (event) => {
    this.update(event.detail);
  };

  //TODO: слушает события и отправляет в нужные места
  initEventListeners() {
    this.element.addEventListener("date-select", this.onChangeDate);
  }

  // TODO: обновляет данные всех элементов
  update({ from, to }) {
    let { ordersChart, salesChart, customersChart, sortableTable } =
      this.components;
    from = from.toISOString();
    to = to.toISOString();

    ordersChart.update(from, to);
    salesChart.update(from, to);
    customersChart.update(from, to);
    sortableTable.update();
  }

  // TODO: Удаляет элементы и обработчики
  remove() {}

  // Полнсотью уничтожает из памяти
  destroy() {}

  // TODO: Элемент ColumnChart обновлять

  // TODO: Sortable-table вызывать с URL уже с from/to, здесь нас интересует bestsllers
  // api/dashboard/bestsellers?from=2022-11-28T13%3A11%3A14.213Z&to=2022-12-28T13%3A11%3A14.213Z
}
