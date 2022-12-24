export default class SortableList {
  constructor(items) {
    this.items = items.items;
    this.render();
  }

  render() {
    const wrapper = document.createElement("div");
    const ul = document.createElement("ul");
    ul.className = "sortable-list";
    let i = 1;
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

      if (event.target.closest("[data-delete-handle]")) {
        event.target.closest(".sortable-list__item").remove();
      }
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
          copyTarget.style.display = "none";

          let elemUnderPointer = document.elementFromPoint(
            event.clientX,
            event.clientY
          );

          try {
            if (!elemUnderPointer) throw new Error("Ты за пределами экрана");
            if (elemUnderPointer === target)
              throw new Error("Лишняя обработка");
            if (elemUnderPointer === target.offsetParent)
              throw new Error("offsetParent не считать");
            if (!elemUnderPointer.closest(".sortable-list"))
              throw new Error("Вернись в контейнер");

            const halfElemUnderPointer = elemUnderPointer.offsetHeight / 2;

            const pointerCoordY = event.pageY - target.offsetParent.offsetTop;
            const bottomCoordElemUnderPointer =
              elemUnderPointer.offsetTop + elemUnderPointer.offsetHeight;

            const bottomHalfElemUnderPointer =
              pointerCoordY >
                bottomCoordElemUnderPointer - halfElemUnderPointer &&
              pointerCoordY < bottomCoordElemUnderPointer;

            const topHalfElemUnderPointer =
              pointerCoordY > elemUnderPointer.offsetTop &&
              pointerCoordY < elemUnderPointer.offsetTop + halfElemUnderPointer;

            let topCoordsElemUnderPointer = parseInt(
              elemUnderPointer.style.top
            );
            let topCoordTargetElem = parseInt(target.style.top);

            const margin =
              parseInt(getComputedStyle(elemUnderPointer).marginTop) ?? 0;

            const step = target.offsetHeight + margin;

            if (bottomHalfElemUnderPointer) {
              topCoordsElemUnderPointer += step;
              topCoordTargetElem -= step;
            }

            if (topHalfElemUnderPointer) {
              topCoordsElemUnderPointer -= step;
              topCoordTargetElem += step;
            }

            elemUnderPointer.style.top = topCoordsElemUnderPointer + "px";
            target.style.top = topCoordTargetElem + "px";
          } catch (e) {
            // console.log(e.message);
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
