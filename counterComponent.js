const BTN_RESTART = "btnRestart";
const ID_COUNTER = "counter";
const COUNTER_VALUE = 100;
const INTERVAL_PERIOD = 10;

(() => {
  class CounterComponent {
    constructor() {
      this.init();
    }

    makeProxyCounter() {
      const handler = {
        set: (currentContext, propertyKey, newValue) => {
          console.log({ currentContext, propertyKey, newValue });
          if (!currentContext.value) {
            currentContext.makeStop();
          }
          currentContext[propertyKey] = newValue;
          return true;
        },
      };

      const counter = new Proxy(
        {
          value: COUNTER_VALUE,
          makeStop: () => {},
        },
        handler
      );
      return counter;
    }

    updatedText =
      ({ counterElement, counter }) =>
      () => {
        const textIdentifier = "$counter";
        const defaultText = `Starting in <b>${textIdentifier}</b> seconds...`;

        counterElement.innerHTML = defaultText.replace(
          textIdentifier,
          counter.value--
        );
      };

    scheduleCounterStop({ counterElement, intervalId }) {
      return () => {
        clearInterval(intervalId);
        counterElement.innerHTML = "";
        this.disableButton(false);
      };
    }

    makeButton(btnElement, initFn) {
      btnElement.addEventListener("click", initFn.bind(this));
      return (value = true) => {
        const attribute = "disabled";
        if (value) {
          btnElement.setAttribute(attribute, value);
          return;
        }
        btnElement.removeAttribute(attribute);
      };
    }

    init() {
      console.log("Initiated");
      const counterElement = document.getElementById(ID_COUNTER);

      const counter = this.makeProxyCounter();
      const args = {
        counterElement,
        counter,
      };

      const fn = this.updatedText(args);

      const intervalId = setInterval(fn, INTERVAL_PERIOD);

      {
        const restartButtonElement = document.getElementById(BTN_RESTART);
        const disableButton = this.makeButton(restartButtonElement, this.init);
        disableButton();
        const args = { counterElement, intervalId };
        const stopCounterFn = this.scheduleCounterStop.apply(
          { disableButton },
          [args]
        );
        counter.makeStop = stopCounterFn;
      }
    }
  }
  window.CounterComponent = CounterComponent;
})();
