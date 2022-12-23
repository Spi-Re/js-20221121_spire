export default class SortableList {
  constructor(items) {
    this.items = items.items;
    this.render();
  }

  render() {
    const wrapper = document.createElement("div");
    const ul = document.createElement("ul");
    ul.className = "sortable-list";
    let i = 0;
    this.items.forEach((item) => {
      item.className = "sortable-list__item";
      item.style.top = 0 + "px";
      item.setAttribute("koko", i);
      ul.append(item);
      i++;
    });
    wrapper.append(ul);
    this.element = wrapper.firstChild;
    document.body.append(this.element);
    this.eventListeners();
  }

  copyTarget(className, attribute, innerHTML) {
    const copyTarget = document.createElement("li");
    copyTarget.className = className;
    copyTarget.innerHTML = innerHTML;
    copyTarget.setAttribute("koko", attribute);
    copyTarget.style.position = "absolute";
    // style.top работает до margin
    copyTarget.style.margin = 0 + "px";
    copyTarget.style.zIndex = 1000;
    return copyTarget;
  }

  eventListeners() {
    let copyOfTargetHTML = "";

    this.element.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      let target = null;
      // TODO: Нужны координаты всех span, которые можно грабать
      // TODO: При переводе на эти координаты, менять весь li местами с target
      // YES = TODO: При pointerUp добавлять классы и HTML target и удалять копию

      if (event.target.closest("[data-grab-handle]")) {
        target = event.target.closest(".sortable-list__item");
        target.ondragstart = () => false;
        copyOfTargetHTML = target.innerHTML;

        const copyTarget = this.copyTarget(
          target.className,
          target.getAttribute("koko"),
          copyOfTargetHTML
        );
        document.body.append(copyTarget);
        target.innerHTML = "";
        target.classList.add("sortable-list__placeholder");

        moveAt(event.pageY);
        document.addEventListener("pointermove", onPointerMove);
        copyTarget.addEventListener("pointerup", onPointerUp);

        // ============================================================
        function onPointerMove(event) {
          moveAt(event.pageY);
          let topOfParent = target.offsetParent.offsetTop;

          copyTarget.style.display = "none";

          let elemBelow = document.elementFromPoint(
            event.clientX,
            event.clientY
          );

          try {
            if (!elemBelow) throw new Error("Ты за пределами экрана");
            if (!elemBelow.closest(".sortable-list"))
              throw new Error("вернись в контейнер");
            if (!elemBelow.closest(".sortable-list__item"))
              throw new Error("Нет нужного родителя");

            // TODO: Нужно прибавлять / убавлять координаты
            // YES - TODO: вниз
            // TODO: вверх
            if (elemBelow !== target) {
              elemBelow.style.top = parseInt(elemBelow.style.top) - 76 + "px";
              target.style.top = parseInt(target.style.top) + 76 + "px";
            }
          } catch (e) {
            console.log(e.message);
          }

          copyTarget.style.display = "flex";
        }
        function moveAt(pageY) {
          copyTarget.style.width = target.offsetWidth + "px";
          copyTarget.style.left = copyTarget.offsetLeft + "px";
          copyTarget.style.top = pageY - target.offsetHeight / 2 + "px";
        }
        function onPointerUp() {
          target.innerHTML = copyOfTargetHTML;
          target.classList.remove("sortable-list__placeholder");
          copyTarget.remove();
          document.removeEventListener("pointermove", onPointerMove);
          copyTarget.onpointerup = null;
        }
      }
    });
  }
}
/* 
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
*/
