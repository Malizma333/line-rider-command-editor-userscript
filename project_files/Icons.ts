/* eslint-disable @typescript-eslint/no-unused-vars */

interface InlineIcon {
  dangerouslySetInnerHTML: {
    __html: string
  }
}

const head = '<svg style="display: block" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
const tail = '</svg>'

const FICON_DOWNLOAD: InlineIcon = {
  dangerouslySetInnerHTML: {
    __html: head + '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line>' + tail
  }
}

const FICON_CORNER_UP_RIGHT: InlineIcon = {
  dangerouslySetInnerHTML: {
    __html: head + '<polyline points="15 14 20 9 15 4"></polyline><path d="M4 20v-7a4 4 0 0 1 4-4h12"></path>' + tail
  }
}

const FICON_PLAY: InlineIcon = {
  dangerouslySetInnerHTML: {
    __html: head + '<polygon points="5 3 19 12 5 21 5 3"></polygon>' + tail
  }
}

const FICON_COPY: InlineIcon = {
  dangerouslySetInnerHTML: {
    __html: head + '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>' + tail
  }
}

const FICON_UPLOAD: InlineIcon = {
  dangerouslySetInnerHTML: {
    __html: head + '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line>' + tail
  }
}

const FICON_SETTINGS: InlineIcon = {
  dangerouslySetInnerHTML: {
    __html: head + '<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>' + tail
  }
}

const FICON_FLAG: InlineIcon = {
  dangerouslySetInnerHTML: {
    __html: head + '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line>' + tail
  }
}

const FICON_HELP_CIRCLE: InlineIcon = {
  dangerouslySetInnerHTML: {
    __html: head + '<circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line>' + tail
  }
}

const FICON_MINIMIZE: InlineIcon = {
  dangerouslySetInnerHTML: {
    __html: head + '<path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>' + tail
  }
}

const FICON_MAXIMIZE: InlineIcon = {
  dangerouslySetInnerHTML: {
    __html: head + '<path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>' + tail
  }
}

const FICON_PLUS: InlineIcon = {
  dangerouslySetInnerHTML: {
    __html: head + '<line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>' + tail
  }
}

const FICON_PLUS_CIRCLE: InlineIcon = {
  dangerouslySetInnerHTML: {
    __html: head + '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line>' + tail
  }
}

const FICON_X: InlineIcon = {
  dangerouslySetInnerHTML: {
    __html: head + '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>' + tail
  }
}

const FICON_TRASH2: InlineIcon = {
  dangerouslySetInnerHTML: {
    __html: head + '<polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line>' + tail
  }
}

const FICON_ARROW_LEFT: InlineIcon = {
  dangerouslySetInnerHTML: {
    __html: head + '<line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline>' + tail
  }
}

const FICON_ARROW_RIGHT: InlineIcon = {
  dangerouslySetInnerHTML: {
    __html: head + '<line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline>' + tail
  }
}

const FICON_CAMERA: InlineIcon = {
  dangerouslySetInnerHTML: {
    __html: head + '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle>' + tail
  }
}
