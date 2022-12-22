export default class SortableList {
  constructor(items) {
    this.items = items.items;
    this.render();
  }

  render() {
    const wrapper = document.createElement("div");
    const ul = document.createElement("ul");
    ul.className = "sortable-list";
    this.items.forEach((item) => {
      item.className = "sortable-list__item";
      ul.append(item);
    });
    wrapper.append(ul);
    this.element = wrapper.firstChild;
    // document.body.append(this.element); // Уже есть в HTML
    this.eventListeners();
  }

  copyElem(className, innerHTML) {
    const copyTarget = document.createElement("li");
    copyTarget.className = className;
    copyTarget.innerHTML = innerHTML;
    copyTarget.style.position = "absolute";
    // style.top работает до margin
    copyTarget.style.margin = 0 + "px";
    copyTarget.style.zIndex = 1000;
    return copyTarget;
  }

  eventListeners() {
    // отслеживаем нажатие

    this.element.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      // подготовил элемент
      let target = null;
      if (event.target.closest("[data-grab-handle]")) {
        target = event.target.closest(".sortable-list__item");
        const elemWidth = target.offsetWidth; // 778
        const elemHeight = target.offsetHeight;

        const copyTarget = this.copyElem(target.className, target.innerHTML);
        target.classList.add("sortable-list__placeholder");
        // TODO: Скрыть содержимое в оригинале, но так, чтобы потом его восстановить.
        // либо в конце снова скопировать из копии
        // либо сделать какой-то буфер, который будет временно хранить эти данные.
        // TODO: оригинал должен следовать за копией в каждую ячейку
        // TODO:

        // перемещение в body, чтобы элемент не был внутри relative
        document.body.append(copyTarget);

        moveAt(event.pageY);
        target.ondragstart = () => false;
        function moveAt(pageY) {
          copyTarget.style.width = elemWidth + "px";
          // по одной вертикали
          copyTarget.style.left = copyTarget.offsetLeft + "px";
          copyTarget.style.top = pageY - elemHeight / 2 + "px";
        }

        function onPointerMove(event) {
          moveAt(event.pageY);
        }
        // Перемещение по экрану
        document.addEventListener("pointermove", onPointerMove);

        copyTarget.onpointerup = function () {
          document.removeEventListener("pointermove", onPointerMove);
          copyTarget.onpointerup = null;
        };
      }
    });
  }
}
