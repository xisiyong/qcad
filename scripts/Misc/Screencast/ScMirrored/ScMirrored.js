/**
 * Copyright (c) 2011-2013 by Andrew Mustun. All rights reserved.
 * 
 * This file is part of the QCAD project.
 *
 * QCAD is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * QCAD is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with QCAD.
 */

include("../Screencast.js");


/**
 * Focus listener. Re-installes event filters if focus has changed
 * (e.g. new document).
 */
/*
function ScInputInfoFocusListener(ef) {
    RFocusListenerAdapter.call(this);
    this.eventFilter = ef;
}

ScInputInfoFocusListener.prototype = new RFocusListenerAdapter();

ScInputInfoFocusListener.prototype.updateFocus = function(di) {
    var appWin = RMainWindowQt.getMainWindow();
    var mdiArea = appWin.findChild("MdiArea");
    this.eventFilter.install(mdiArea);
};
*/



/**
 * Event filter installed for all widgets, tracks mouse, keys, etc.
 */
function ScInputInfoEventFilter() {
    QObject.call(this);
    this.stopped = false;
    this.quit = false;
    this.buttons = undefined;
    this.button = undefined;
    this.key = undefined;
    this.shortcut = undefined;

    this.highlightWidget = undefined;
    this.widgetTimer = undefined;

    this.mouseInfo = undefined;
    this.mouseTimer = undefined;

    this.keyInfo = undefined;
    this.keyTimer = undefined;
}

ScInputInfoEventFilter.prototype = new QObject();

ScInputInfoEventFilter.prototype.install = function(w) {
    if (this.quit) {
        return;
    }
    this.stopped = false;

    var kids = w.children();
    for (var i=0; i<kids.length; i++) {
        var k = kids[i];
        if (isNull(k.gotEventFilter)) {
            k.installEventFilter(this);
            //k.mouseTracking = true;
            k.setProperty("gotEventFilter", true);
        }
        this.install(k);
    }
};

ScInputInfoEventFilter.prototype.uninstall = function(w) {
    //qDebug("UNINSTALLING EVENT FILTERS");
    var kids = w.children();
    for (var i=0; i<kids.length; i++) {
        var k = kids[i];
        if (isNull(k.gotEventFilter) && isFunction(k.removeEventFilter)) {
            k.removeEventFilter(this);
            k.setProperty("gotEventFilter", undefined);
        }
        this.uninstall(k);
    }
};

ScInputInfoEventFilter.prototype.eventFilter = function(watched, e) {
    if (this.stopped || this.quit) {
        return false;
    }

    var appWin = RMainWindowQt.getMainWindow();
    e = e.cast();
    var type = e.type().toString();
    var objectName = watched.objectName;

    if (type==="DeferredDelete") {
        return true;
    }

    if (type==="ToolTip") {
        return true;
    }

    //qDebug("type: ", type);
    //qDebug("objectName: ", objectName);

    if (type.contains("Close") && objectName.contains("Untitled")) {
        //qDebug("type: ", type);
        //qDebug("objectName: ", objectName);
        this.uninstall(appWin);
        this.stopped = true;
        return false;
    }

    if (!type.contains("Mouse") &&
        !type.contains("Key") &&
        !type.contains("Shortcut") &&
        !type.contains("Focus") &&
        !type.contains("Enter") &&
        !type.contains("Leave") &&
        !type.contains("ContextMenu")) {

        //qDebug("object: ", watched.objectName);
        //qDebug("type: ", type);

        return false;
    }

    var installFilter = false;
    var updatePos = false;

    switch (type) {
        case "MouseButtonRelease":
        case "MouseButtonPress":
        case "MouseMove":
            this.button = e.button().valueOf();
            this.buttons = e.buttons().valueOf();
            break;
    }

    switch (type) {
        case "ContextMenu":
            installFilter = true;
            break;

        case "MouseButtonRelease":
            //updatePos = true;
            //this.hideMouseLabel();
            this.mouseTimer = 500;
            break;

        case "MouseButtonPress":
            //this.showMouseLabel();
            if (this.buttons!==Qt.RightButton.valueOf()) {
                installFilter = true;
            }
            this.mouseTimer = -1;
            //updatePos = true;
            break;

        case "MouseMove":
            //updatePos = true;
            break;

        case "Shortcut":
            this.shortcut = e.key();
            this.keyInfo = this.shortcut.toString();
            this.keyTimer = 500;
            qDebug("this.shortcut: ", this.shortcut);
            break;

        case "KeyPress":
        case "ShortcutOverride":
            this.key = e.key().valueOf();
            this.modifiers = e.modifiers().valueOf();
            break;

        case "KeyRelease":
            this.key = undefined;
            this.modifiers = undefined;
            break;
    }

    if (this.button===Qt.LeftButton.valueOf() || this.buttons===Qt.LeftButton.valueOf()) {
        this.mouseInfo = "left";
    }
    else if (this.button===Qt.MidButton.valueOf() || this.buttons===Qt.MidButton.valueOf()) {
        this.mouseInfo = "middle";
    }
    else if (this.button===Qt.RightButton.valueOf() || this.buttons===Qt.RightButton.valueOf()) {
        this.mouseInfo = "right";
    }

//    if (!isNull(this.shortcut)) {
//        this.keyInfo = this.shortCut.toString();
//    }

    if (this.key===Qt.Key_QuoteLeft.valueOf()) {
        this.highlightWidget = QApplication.widgetAt(QCursor.pos());
        this.widgetTimer = -1;

        //var pos = this.highlightWidget.pos;
        //pos.setX(pos.x() + this.highlightWidget.width);
        //var pos = new QPoint(this.highlightWidget.width-5, 5);
        //var gpos = this.highlightWidget.mapToGlobal(pos);

        // TODO: show tool tip at fixed location, away from highlighted widget:
        //QToolTip.showText(gpos, this.highlightWidget.toolTip);

//        var toolTipEvent = new QHelpEvent(
//            QEvent.ToolTip,
//            pos,
//            QCursor.pos()
//            //gpos
//        );
//        QCoreApplication.postEvent(this.highlightWidget, toolTipEvent);
    }

    if (installFilter) {
        if (objectName!=="GraphicsView" &&
            objectName!=="MdiArea" &&
            objectName!=="Form" &&
            !objectName.startsWith("Viewport") &&
            objectName!=="Single") {

            var self = this;
            for (var i=0; i<2; i++) {
                var singleShot = new QTimer();
                singleShot.singleShot = true;
                singleShot.timeout.connect(function() {
                    //self.mouseLabel.raise();
                    self.install(appWin);
                });
                singleShot.start(20 + i*200);
            }
        }
    }

//    if (updatePos) {
//        var pos = QCursor.pos();
//        this.mouseLabel.move(pos.x()+10, pos.y()+10);
//    }

    return false;
};




/**
 * This action creates a Qt main window.
 */
function ScMirrored(guiAction) {
    EAction.call(this, guiAction);
}

ScMirrored.prototype = new EAction();
ScMirrored.includeBasePath = includeBasePath;
ScMirrored.interval = 50;

ScMirrored.prototype.beginEvent = function() {
    EAction.prototype.beginEvent.call(this);

    this.w = 1280;
    this.h = 670;
    this.x = 0;
    this.y = 20;

    this.iconSize = 32;

    var appWin = RMainWindowQt.getMainWindow();
    appWin.resize(this.w,this.h);
    appWin.move(this.x,this.y);
    //appWin.setAttribute(Qt.WA_MacAlwaysShowToolWindow);
    //appWin.setAttribute(Qt.WA_MacNoCocoaChildWindow);

    //var flags = new Qt.WindowFlags(appWin.windowFlags.valueOf() + Qt.FramelessWindowHint.valueOf());
    //var flags = new Qt.WindowFlags(appWin.windowFlags());
    //var flags = new Qt.WindowFlags(Qt.FramelessWindowHint | Qt.WindowStaysOnTopHint | Qt.Tool);
    //appWin.setWindowFlags(flags);

    var pe = appWin.findChild("PropertyEditorDock");
    pe.show();
    pe.maximumWidth = 280;

    var ll = appWin.findChild("LayerListDock");
    ll.show();
    ll.maximumWidth = 220;

    var bl = appWin.findChild("BlockListDock");
    bl.show();
    bl.maximumWidth = 220;

    var ct = appWin.findChild("CamToolBar");
    ct.hide();

    var cl = appWin.findChild("CommandLineDock");
    cl.hide();

    this.mirrorWidget = new QLabel(appWin);
    this.mirrorWidget.setAttribute(Qt.WA_MacAlwaysShowToolWindow);
    this.mirrorWidget.setAttribute(Qt.WA_TransparentForMouseEvents);
    this.mirrorWidget.resize(this.w,this.y+this.h+30);
    this.mirrorWidget.move(this.x+this.w,this.y);
//    this.mirrorWidget.resize(this.w,this.h);
//    this.mirrorWidget.move(this.x,this.y);
    this.mirrorWidget.focusPolicy = Qt.NoFocus;
    var flags = new Qt.WindowFlags(Qt.FramelessWindowHint | Qt.WindowStaysOnTopHint | Qt.Tool);
    this.mirrorWidget.setWindowFlags(flags);
    this.mirrorWidget.setAttribute(Qt.WA_MacNoShadow);
    this.mirrorWidget.setAttribute(Qt.WA_DeleteOnClose);
    this.mirrorWidget.setAttribute(Qt.WA_ShowWithoutActivating);

    this.mirrorWidget.show();

    this.cursors = {
        "ArrowCursor": [5,5],
        "CrossCursor": [15,15],
        "WindowZoomCursor": [12,12],
        "PrintPreviewOffsetCursor": [16,16],
        "OpenHandCursor": [16,16],
        "ClosedHandCursor": [16,16],
        "IBeamCursor": [16,16]
    };

    for (var cursorShape in this.cursors) {
        this.cursors[cursorShape].push(ScMirrored.createPixmap(
            ScMirrored.includeBasePath + "/" + cursorShape + ".svg", this.iconSize,this.iconSize));
    }

    this.mousePixmap = [];
    this.mousePixmap["left"] = ScMirrored.createPixmap(ScMirrored.includeBasePath + "/MouseButtonLeft.svg", this.iconSize,this.iconSize);
    this.mousePixmap["middle"] = ScMirrored.createPixmap(ScMirrored.includeBasePath + "/MouseButtonMiddle.svg", this.iconSize,this.iconSize);
    this.mousePixmap["right"] = ScMirrored.createPixmap(ScMirrored.includeBasePath + "/MouseButtonRight.svg", this.iconSize,this.iconSize);

    // start mirroring:
    var t = new QTimer(this.mirrorWidget);
    t.interval = ScMirrored.interval;
    t.timeout.connect(this, "mirror");

    this.ef = new ScInputInfoEventFilter(this);
    this.ef.install(appWin);

    var self = this;
    appWin.closeRequested.connect(function() {
        qDebug("ScMirrored: closeRequested");
        self.ef.stopped = true;
        self.ef.quit = true;
        //self.ef.uninstall(appWin.findChild("MdiArea"));
        self.ef.uninstall(appWin);
        qDebug("ScMirrored: closeRequested: OK");
    });

    //var fl = new ScInputInfoFocusListener(ef);
    //appWin.addFocusListener(fl);

    //appWin.setProperty("ScreencastRunning", true);
    t.start();

    this.terminate();
};

ScMirrored.prototype.mirror = function() {
    var pm = QPixmap.grabWindow(QApplication.desktop().winId(), 0, 0, this.w, this.y+this.h+30);

    var painter = new QPainter();
    painter.begin(pm);

    //qDebug("bs: ", this.ef.buttons);
    //qDebug("b: ", this.ef.button);
    //if (!isNull(this.ef.key)) {
        //qDebug("k: ", "0x%1".arg(this.ef.key.valueOf(), 0, 16));
    //}
    //qDebug("m: ", this.ef.modifiers);
    //qDebug("shortcut: ", this.ef.shortcut);

    this.paintLogo(painter, pm);
    this.paintHighlightedWidget(painter);
    this.paintCursor(painter);
    this.paintMouseInfo(painter);
    this.paintKeyInfo(painter);

    painter.end();

    this.mirrorWidget.pixmap = pm;
    collectGarbage();
};

/**
 * Overpaint a**le logo.
 */
ScMirrored.prototype.paintLogo = function(painter, pixmap) {
    if (RS.getSystemId()!=="osx") {
        return;
    }

    var bg = pixmap.copy(0,0,18,21);
    painter.drawPixmap(19,0,bg);
};

/**
 * Paint mouse cursor.
 */
ScMirrored.prototype.paintCursor = function(painter) {
    var pos = QCursor.pos();
    var widget = QApplication.widgetAt(pos);
    var shape;
    if (!isNull(widget)) {
        shape = widget.cursor.shape().toString();
    }

    if (shape==="BitmapCursor") {
        shape = widget["CursorName"];
    }

    if (isNull(shape)|| isNull(this.cursors[shape])) {
        shape = "ArrowCursor";
    }

    var cursor = this.cursors[shape];
    pos.operator_add_assign(new QPoint(-cursor[0], -cursor[1]));
    painter.drawPixmap(pos, cursor[2]);
};

/**
 * Paint mouse button info.
 */
ScMirrored.prototype.paintMouseInfo = function(painter) {
    if (this.ef.mouseTimer<=0 && this.ef.mouseTimer!==-1) {
        return;
    }

    var pos = QCursor.pos();
    pos.setX(pos.x() + this.iconSize/2);

    var alpha;
    if (this.ef.mouseTimer!==-1) {
        this.ef.mouseTimer = Math.max(this.ef.mouseTimer-ScMirrored.interval, 0);
        alpha = Math.max(Math.min(this.ef.mouseTimer, 255), 0);
    }
    else {
        alpha = 255;
    }

    painter.setOpacity(alpha/255);

    if (!isNull(this.mousePixmap[this.ef.mouseInfo])) {
        painter.drawPixmap(pos, this.mousePixmap[this.ef.mouseInfo]);
    }
};

/**
 * Paint key info.
 */
ScMirrored.prototype.paintKeyInfo = function(painter) {
    qDebug("keyInfo: ", this.ef.keyInfo);
    qDebug("keyTimer: ", this.ef.keyTimer);

    if (this.ef.keyTimer<=0 && this.ef.keyTimer!==-1) {
        return;
    }

    if (isNull(this.ef.keyInfo)) {
        return;
    }

    var pos = QCursor.pos();
    pos.setX(pos.x() + this.iconSize*1.5);

    var alpha;
    if (this.ef.keyTimer!==-1) {
        this.ef.keyTimer = Math.max(this.ef.keyTimer-ScMirrored.interval, 0);
        alpha = Math.max(Math.min(this.ef.keyTimer, 255), 0);
    }
    else {
        alpha = 255;
    }

    painter.setOpacity(alpha/255);

//    if (!isNull(this.keyPixmap[this.ef.mouseInfo])) {
//        painter.drawPixmap(pos, this.mousePixmap[this.ef.mouseInfo]);
//    }
    painter.drawText(pos, this.ef.keyInfo);
};

/**
 * Highlight widget under cursor.
 */
ScMirrored.prototype.paintHighlightedWidget = function(painter) {
    if (isNull(this.ef.highlightWidget)) {
        return;
    }

    if (this.ef.widgetTimer<=0 && this.ef.widgetTimer!==-1) {
        return;
    }

    var pos = QCursor.pos();
    var widget = QApplication.widgetAt(pos);

    // cursor moved away: fade out:
    if (widget!==this.ef.highlightWidget && (this.ef.widgetTimer>500 || this.ef.widgetTimer===-1)) {
        this.ef.widgetTimer = 500;
    }

    var alpha;
    if (this.ef.widgetTimer!==-1) {
        this.ef.widgetTimer = Math.max(this.ef.widgetTimer-ScMirrored.interval, 0);
        alpha = Math.max(Math.min(this.ef.widgetTimer, 255), 0);
    }
    else {
        alpha = 255;
    }

    //qDebug("widget.objectName: ", widget.objectName);
    painter.setBrush(new QBrush(new QColor(255,0,0,alpha/8)));
    var pen = new QPen(new QColor(255,0,0,alpha/2));
    pen.setWidth(2);
    painter.setPen(pen);
    var wpos = this.ef.highlightWidget.mapToGlobal(new QPoint(0,0));
    painter.drawRect(wpos.x(), wpos.y(), this.ef.highlightWidget.width, this.ef.highlightWidget.height);
};

ScMirrored.createPixmap = function(file, w, h) {
    var pixmap = new QPixmap(w,h);
    pixmap.fill(new QColor(0,0,0,0));
    var p = new QPainter();
    p.begin(pixmap);
    var r = new QSvgRenderer();
    r.load(file);
    r.render(p);
    p.end();
    return pixmap;
}



/**
 * Adds a menu for this action to Examples/Math Examples/ScMirrored.
 */
ScMirrored.init = function(basePath) {
    var action = new RGuiAction("&Mirrored", RMainWindowQt.getMainWindow());
    action.setRequiresDocument(false);
    action.setScriptFile(basePath + "/ScMirrored.js");
    action.setSortOrder(20);
    action.setDefaultCommands(["screencast"]);
    EAction.addGuiActionTo(action, Screencast, true, false, false);
};