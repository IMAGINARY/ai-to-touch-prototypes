(() => {
  const params = new URLSearchParams(document.location.search.substring(1));
  const useTouch = params.get('touch') === 'true';
  const useGamepad = params.get('gamepad') === 'true';

  let direction = 0;
  let acceleration = 0;
  let buttonFired = false;

  //
  // Gamepad
  //
  let gamepad = null;
  let gamepadLastDirection = null;
  let gamepadButtonDown = false;
  const readGamepad = () => {
    if (gamepad !== null) {
      const gp = navigator.getGamepads()[gamepad];
      let newDirection = (gp.axes[0] < -0.5)
        ? -1
        : (gp.axes[0] > 0.5)
          ? 1
          : 0;
      if (newDirection !== gamepadLastDirection) {
        acceleration = 0;
        direction = newDirection;
      }
      gamepadLastDirection = newDirection;
      if (gp.buttons[1].pressed || gp.buttons[2].pressed) {
        if (!gamepadButtonDown) {
          buttonFired = true;
        }
        gamepadButtonDown = true;
      } else {
        gamepadButtonDown = false;
      }
    }
  };

  const initGamepad = () => {
    window.addEventListener("gamepadconnected", function(e) {
      console.log(`Gamepad ${e.gamepad.id} connected.`);
      gamepad = e.gamepad.index;
    });

    window.addEventListener("gamepaddisconnected", function(e) {
      console.log(`Gamepad ${e.gamepad.id} disconnected.`);
      gamepad = null;
    });
  };

  if (useGamepad) {
    initGamepad();
  }

  //
  // Touch controls
  //
  function handleLeftDown() {
    direction = -1;
    acceleration = 0;
  }

  function handleRightDown() {
    direction = 1;
    acceleration = 0;
  }

  function handlePointerUp() {
    direction = 0;
    acceleration = 0;
  }

  function handleAction() {
    buttonFired = true;
  }

  function initTouchControls() {
    const controls = document.createElement('div');
    controls.classList.add('touch-controls');

    const leftButton = document.createElement('button');
    leftButton.setAttribute('type', 'button');
    leftButton.classList.add('left');
    leftButton.addEventListener('pointerdown', handleLeftDown);
    controls.appendChild(leftButton);

    const actionButton = document.createElement('button');
    actionButton.setAttribute('type', 'button');
    actionButton.classList.add('action');
    actionButton.addEventListener('pointerdown', handleAction);
    controls.appendChild(actionButton);

    const rightButton = document.createElement('button');
    rightButton.setAttribute('type', 'button');
    rightButton.classList.add('right');
    rightButton.addEventListener('pointerdown', handleRightDown);
    controls.appendChild(rightButton);

    document.addEventListener('pointerup', handlePointerUp);

    document.querySelector('body').appendChild(controls);
  }

  if (useTouch) {
    initTouchControls();
  }

  if (useTouch || useGamepad) {
    const accelerationStep = 0.01;
    const minSpeed = 0.1;
    const maxSpeed = 2;
    const stepSize = 0.01;

    let lastTimestamp = null;
    //
    // Control loop
    //
    const controlLoop = (timestamp) => {
      if (gamepad !== null) {
        readGamepad();
      }
      if (buttonFired) {
        cdy.evokeCS('boatprobe();');
        buttonFired = false;
      }
      // Boat movement
      if (lastTimestamp && direction !== 0) {
        const speed = minSpeed + (maxSpeed - minSpeed) * acceleration * acceleration;
        const delta = direction * speed * stepSize * (timestamp - lastTimestamp);
        if (acceleration < 1) {
          acceleration += accelerationStep;
        }
        cdy.evokeCS(`boatmove(${delta})`);
      }
      lastTimestamp = timestamp;
      window.requestAnimationFrame(controlLoop);
    };
    window.requestAnimationFrame(controlLoop);
  }
})();
