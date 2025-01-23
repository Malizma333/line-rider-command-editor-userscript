if (window.store) {
  main()
} else {
  const prevInit = window.onAppReady
  window.onAppReady = () => {
    if (prevInit) prevInit()
    main()
  }
}
