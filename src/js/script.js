// Main class
class Slider {
  constructor(options, sliderElements, slidesToLoad) {
    if (!options || !sliderElements) return;

    // Save all breakpoints
    this.breakpoints = [ ...options ];

    const {
      slidesToShow,
      slidesToShift,
      showButtons,
      showPaging,
      infinite,
      breakpoint
    } = options[0];

    const {
      container,
      view,
      wrapper,
      slides
    } = sliderElements;
 
    // Slider config options
    this.slidesToShow = slidesToShow;
    this.slidesToShift = slidesToShift || 1;
    this.showButtons = showButtons;
    this.showPaging = showPaging;
    this.infinite = infinite;
    this.breakpoint = breakpoint;

    // Main slider elements
    this.container = document.querySelector(container);
    this.view = document.querySelector(view);
    this.wrapper = document.querySelector(wrapper);
    this.slides = this.wrapper.querySelectorAll(slides);

    // Initial slider position values
    this.index = 0;
    this.posX1 = 0;
    this.posX2 = 0;
    this.startPos = 0;
    this.endPos = 0;
    this.limit = 50;
    this.allowShift = true;

    // Initial slider element properties
    this.slideSize = 0;
    this.slidesLength = 0;
    this.slidesToLoad = slidesToLoad || this.slidesLength;

    // Set the slider size
    this.slideSize = (
      Number(getComputedStyle(this.slides[0]).marginLeft.replace('px', '')) +
      Number(getComputedStyle(this.slides[0]).marginRight.replace('px', '')) +
      Number(getComputedStyle(this.slides[0]).width.replace('px', ''))
    );
    
    // Set the total amount of slides
    this.slidesLength = this.slides.length;

    // Set the total size of the wrapper
    this.wrapper.style.width = String(this.slideSize * this.slidesToLoad) + 'px';

    // Set the max number of slides to load
    if (!isNaN(this.slidesToLoad) && this.slidesToLoad !== null) {
      if (this.slidesToLoad < this.slidesLength) {
        for (let i = 0; i < this.slidesLength; i++) {
          if (i >= this.slidesToLoad) this.slides[i].remove();
        }
        this.slidesLength = this.slidesToLoad;
      }
    }
    
    // Set initial position of the slider
    this.wrapper.style.left = '0px';

    // Set the size of the view
    this.view.style.width = (this.slideSize * this.slidesToShow) + 'px';

    // Build slider navigation buttons
    if (this.showButtons) {
      this.prev = 'undefined';
      this.next = 'undefined';
      this.buildButtons();
    }
    
    // Build slider navigation paging
    if (this.showPaging) {
      this.paging = 'undefined';
      this.buildPaging();
    }

    // Automaticaly initialize the slider events
    this.initDragEvents();

    // Adjust the slider view
    this.handleBreakpoints();

    // Slider is loaded
    this.container.classList.add('loaded');
  }

  // Handle breakpoints in the page
  handleBreakpoints() {
    if (this.breakpoints.length > 1) {
      for (let i = 0; i < this.breakpoints.length; i++) {
        if (this.breakpoints[i + 1] !== undefined) {
          if (
            window.innerWidth <= this.breakpoints[i].breakpoint &&
            window.innerWidth > this.breakpoints[i + 1].breakpoint
          ) {
            const breakpoint = { ...this.breakpoints[i] }
            this.resizeSlider(breakpoint);
          }
        } else {
          if (
            window.innerWidth <= this.breakpoints[i].breakpoint &&
            window.innerWidth > 0
          ) {
            const breakpoint = { ...this.breakpoints[i] }
            this.resizeSlider(breakpoint);
          }
        }
      }
    } else {
      this.breakpoints.push({
        slidesToShow: 1,
        slidesToShift: 1,
        showButtons: this.showButtons,
        showPaging: this.showPaging,
        infinite: this.infinite,
        breakpoint: 500
      });

      this.handleBreakpoints();
    }
  }

  // Update slider configurations and properties
  resizeSlider(options) {
    this.container.classList.remove('loaded');

    // Slider config options
    this.slidesToShow = options.slidesToShow;
    this.slidesToShift = options.slidesToShift || 1;
    this.showButtons = options.showButtons;
    this.showPaging = options.showPaging;
    this.infinite = options.infinite;
    this.breakpoint = options.breakpoint;

    // Initial slider position values
    this.index = 0;
    this.posX1 = 0;
    this.posX2 = 0;
    this.startPos = 0;
    this.endPos = 0;
    this.limit = 50;
    this.allowShift = true;

    // Initial slider element properties
    this.slideSize = 0;

    // Set the slider size
    this.slideSize = (
      Number(getComputedStyle(this.slides[0]).marginLeft.replace('px', '')) +
      Number(getComputedStyle(this.slides[0]).marginRight.replace('px', '')) +
      Number(getComputedStyle(this.slides[0]).width.replace('px', ''))
    );

    // Set the total size of the wrapper
    this.wrapper.style.width = String(this.slideSize * this.slidesToLoad) + 'px';
    
    // Set initial position of the slider
    this.wrapper.style.left = '0px';

    // Set the size of the view
    this.view.style.width = (this.slideSize * this.slidesToShow) + 'px';

    // Build slider navigation buttons
    if (this.showButtons) {
      const buttons = this.container.querySelectorAll('.control');
      if (buttons.length) buttons.forEach(element => element.remove());
      this.buildButtons();
    }

    // Build slider navigation paging
    if (this.showPaging) {
      const paging = this.container.querySelector('.paging');
      if (paging) paging.remove();
      this.buildPaging();
    }

    this.container.classList.add('loaded');
  }

  // Fix problems with keyboard events
  initKeysEvents(...elementNames) {
    // Fix the tab press on the end of inputs inside forms inside the slider
    this.view.addEventListener('keydown', (event) => {
      if (event.key === 'Tab') {
        const eventInput = event.target;

        elementNames.forEach((element) => {
          if (element === eventInput.name) {
            event.preventDefault();
            this.shiftSlide(1);
          }
        })
      }
    })
  }
  
  // Init drag events with mouse tochscreen
  initDragEvents() {
    // Event triggered on press the left mouse button/touch the screen
    let dragStart = (event) => {
      this.view.classList.add('grabbing');

      this.startPos = this.wrapper.offsetLeft;

      if (event.type === 'touchstart') {
        const touchStart = event;

        this.posX1 = touchStart.touches[0].clientX;
      } else if (event.type === 'mousedown') {
        const mouseDown = event;

        this.posX1 = mouseDown.clientX;
        document.addEventListener('mouseup', dragEnd);
        document.addEventListener('mousemove', dragOut);
      }
    }

    // Event triggered on move the mouse/finger across the screen
    let dragOut = (event) => {
      if (event.type === 'touchmove') {
        const touchMove = event;

        this.posX2 = this.posX1 - touchMove.touches[0].clientX;
        this.posX1 = touchMove.touches[0].clientX;
      } else if (event.type === 'mousemove') {
        const mouseMove = event;

        this.posX2 = this.posX1 - mouseMove.clientX;
        this.posX1 = mouseMove.clientX;
      }

      this.wrapper.style.left = (this.wrapper.offsetLeft - this.posX2) + 'px';
    }

    // Event triggered when user release the mouse button/finger from the screen
    let dragEnd = ()  => {
      this.view.classList.remove('grabbing');

      this.endPos = this.wrapper.offsetLeft;

      if (this.endPos - this.startPos < -this.limit) {
        this.shiftSlide(1, 'drag');
      } else if (this.endPos - this.startPos > this.limit) {
        this.shiftSlide(-1, 'drag');
      } else {
        this.wrapper.style.left = (this.startPos) + 'px';
      }

      document.removeEventListener('mouseup', dragEnd);
      document.removeEventListener('mousemove', dragOut);
    }

    // Bind this in the handler functions
    dragStart = dragStart.bind(this);
    dragOut = dragOut.bind(this);
    dragEnd = dragEnd.bind(this);

    // Mouse events
    this.view.addEventListener('mousedown', dragStart);

    // Touch events
    this.view.addEventListener('touchstart', dragStart);
    this.view.addEventListener('touchmove', dragOut);
    this.view.addEventListener('touchend', dragEnd);

    // Transition events
    this.view.addEventListener('transitionend', () => this.checkIndex());

    // Resize events
    window.addEventListener('resize', () => this.handleBreakpoints());
  }

  // Hide slider buttons on the screen depending on position
  hideButton() {
    if (!this.infinite) {
      if (this.index === 0) {
        if (this.prev) this.prev.classList.add('hide');
      } else {
        if (this.prev && this.prev.classList.contains('hide')) {
          this.prev.classList.remove('hide');
        }
      }

      if (this.index === (this.slidesLength - 1) - ((this.slidesLength - 1) % this.slidesToShift)) {
        if (this.next) this.next.classList.add('hide');
      } else {
        if (this.next && this.next.classList.contains('hide')) {
          this.next.classList.remove('hide');
        }
      }
    }
  }

  // Prevents the slider from going over the limit
  shiftLimit () {
    if (this.infinite) {
      if (this.index < 0) {
        if (this.slidesLength % this.slidesToShift !== 0) {
          this.wrapper.style.left = -(
            (this.slidesLength - (this.slidesLength % this.slidesToShift)) * this.slideSize
          ) + 'px';

          this.index = this.slidesLength - (this.slidesLength % this.slidesToShift);
        } else {
          this.wrapper.style.left = -(
            (this.slidesLength - this.slidesToShift) * this.slideSize
          ) + 'px';

          this.index = this.slidesLength - this.slidesToShift;
        }
      } else if (this.index >= this.slidesLength) {
        this.wrapper.style.left = '0px';
        this.index = 0;
      }
    } else {
      if (this.index < 0) {
        this.wrapper.style.left = '0px';
        this.index = 0;
      } else if (this.index >= this.slidesLength) {
        if (this.slidesLength % this.slidesToShift !== 0) {
          this.wrapper.style.left = -(
            (this.slidesLength - (this.slidesLength % this.slidesToShift)) * this.slideSize
          ) + 'px';

          this.index = this.slidesLength - (this.slidesLength % this.slidesToShift);
        } else {
          this.wrapper.style.left = -(
            (this.slidesLength - this.slidesToShift) * this.slideSize
          ) + 'px';

          this.index = this.slidesLength - this.slidesToShift;
        }
      }
    }
  }

  // Change the slider depending on the drag/click button event
  shiftSlide(dir, action) {
    this.wrapper.classList.add('shifting');

    if (this.allowShift) {
      this.allowShift = false;

      if (!action) { this.startPos = this.wrapper.offsetLeft; }

      if (dir === 1) {
        this.wrapper.style.left = (
          this.startPos - (this.slideSize * this.slidesToShift)
        ) + 'px'
        this.index += this.slidesToShift;
      } else if (dir === -1) {
        this.wrapper.style.left = (
          this.startPos + (this.slideSize * this.slidesToShift)
        ) + 'px';
        this.index -= this.slidesToShift;
      }
    }

    this.shiftLimit();
  }

  // Event triggered after slide animations
  checkIndex() {
    this.wrapper.classList.remove('shifting');

    if (this.showPaging) this.updatePagingIndex();

    if (this.showButtons) this.hideButton();

    const leftPosition = parseInt(this.wrapper.style.left);
    
    if (leftPosition % this.slideSize !== 0) this.jumpSlide(this.index);
    
    this.allowShift = true;
  }

  // Update index when pass sliders
  updatePagingIndex() {
    if (this.paging) {
      this.paging.querySelectorAll('.index').forEach((element) => {
        const elementIndex = Number(
          element.classList.toString().replace(/\D/g, '')
        );

        if (elementIndex === this.index) {
          if (!element.classList.contains('active')) {
            element.classList.add('active');
          }
        } else {
          if (element.classList.contains('active')) {
            element.classList.remove('active');
          }
        }
      });
    }
  }

  // Event triggered on the paging navigation
  jumpSlide(index) {
    this.wrapper.classList.add('shifting');
    this.allowShift = false;

    if (index < 0 && this.infinite) {
      index = this.slidesLength - 1;
    } else if (index >= this.slidesLength && this.infinite) {
      index = 0;
    } else if (index < 0) {
      index = 0;
    } else if (index >= this.slidesLength) {
      index = this.slidesLength - 1;
    }

    this.wrapper.style.left = -(index * this.slideSize) + 'px';

    this.index = index;
  }

  // Create slider paging navigation
  buildPaging() {
    this.paging = document.createElement('div');
    this.paging.classList.add('paging');

    for (let i = 0; i < this.slidesLength; i++) {
      if (i % this.slidesToShift === 0) {
        const pagingItem = document.createElement("span");

        pagingItem.classList.add('index');
        pagingItem.classList.add(i);
        if (i === 0) pagingItem.classList.add('active');

        pagingItem.addEventListener('click', () => {
          this.jumpSlide(i);
        });

        if (this.paging) {
          this.paging.insertAdjacentElement('beforeend', pagingItem);
        }
      }
    }

    this.container.insertAdjacentElement('beforeend', this.paging);
  }

  // Create slider navigation buttons
  buildButtons() {
    // Previous button
    this.prev = document.createElement('span');
    this.prev.setAttribute('id', 'prev');
    this.prev.classList.add('control', 'prev');
    if (!this.infinite) this.prev.classList.add('hide');
    
    // Next button
    this.next = document.createElement('span');
    this.next.setAttribute('id', 'next');
    this.next.classList.add('control', 'next');

    // Iserting the buttons in slider element
    this.view.insertAdjacentElement('beforebegin', this.prev);
    this.view.insertAdjacentElement('afterend', this.next);

    // Init click events
    this.prev.addEventListener('click', () => this.shiftSlide(-1));
    this.next.addEventListener('click', () => this.shiftSlide(1));
  }
}

const slider = new Slider(
  [
    {
      slidesToShow: 4,
      slidesToShift: 4,
      showButtons: true,
      showPaging: true,
      infinite: false,
      breakpoint: 9999
    },
    {
      slidesToShow: 2,
      slidesToShift: 2,
      showButtons: true,
      showPaging: true,
      infinite: false,
      breakpoint: 990
    },
    {
      slidesToShow: 1,
      slidesToShift: 1,
      showButtons: true,
      showPaging: true,
      infinite: false,
      breakpoint: 690
    }
  ],
  {
    container: '#container',
    view: '#view',
    wrapper: '#wrapper',
    slides: '.slide',
  },
  6
);

const slider2 = new Slider(
  [
    {
      slidesToShow: 4,
      slidesToShift: 4,
      showButtons: true,
      showPaging: true,
      infinite: false,
      breakpoint: 9999
    },
    {
      slidesToShow: 2,
      slidesToShift: 2,
      showButtons: true,
      showPaging: true,
      infinite: false,
      breakpoint: 990
    },
    {
      slidesToShow: 1,
      slidesToShift: 1,
      showButtons: true,
      showPaging: true,
      infinite: false,
      breakpoint: 690
    }
  ],
  {
    container: '#container-2',
    view: '#view-2',
    wrapper: '#wrapper-2',
    slides: '.slide-2',
  },
  6
);
