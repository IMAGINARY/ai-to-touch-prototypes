(() => {
  const params = new URLSearchParams(document.location.search.substring(1));
  if (params.get('touch') === 'true') {
    let direction = 0;
    let acceleration = 0;
    const accelerationStep = 0.01;
    const minSpeed = 0.1;
    const maxSpeed = 2;
    const stepSize = 0.01;

    let lastTimestamp = null;
    const controlLoop = (timestamp) => {
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
      cdy.evokeCS('boatprobe();');
    }

    function init() {
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
      actionButton.addEventListener('click', handleAction);
      controls.appendChild(actionButton);

      const rightButton = document.createElement('button');
      rightButton.setAttribute('type', 'button');
      rightButton.classList.add('right');
      rightButton.addEventListener('pointerdown', handleRightDown);
      controls.appendChild(rightButton);

      document.addEventListener('pointerup', handlePointerUp);

      document.querySelector('body').appendChild(controls);
    }

    init();
  }
})();
