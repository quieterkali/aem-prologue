/*
 * ADOBE SYSTEMS INCORPORATED
 * Copyright 2014 Adobe Systems Incorporated
 * All Rights Reserved.

 * NOTICE:  Adobe permits you to use, modify, and distribute this file in accordance with the
 * terms of the Adobe license agreement accompanying it.  If you have received this file from a
 * source other than Adobe, then your use, modification, or distribution of it requires the prior
 * written permission of Adobe.
 */
 
(function($, ADB, Configuration, DefaultCommCenter) {
    'use strict';

    var Event = ADB.core.radio.Event;
    var extend = ADB.core.extend;

    var VideoInfo = ADB.va.VideoInfo;
    var AdBreakInfo = ADB.va.AdBreakInfo;
    var AdInfo = ADB.va.AdInfo;
    var ChapterInfo = ADB.va.ChapterInfo;

    extend(PlayerEvent, Event);

    function PlayerEvent(type, data) {
        PlayerEvent.__super__.constructor.call(this, type, data);
    }

    PlayerEvent.VIDEO_LOAD = 'video_load';
    PlayerEvent.VIDEO_UNLOAD = 'video_unload';
    PlayerEvent.PLAY = 'play';
    PlayerEvent.PAUSE = 'pause';
    PlayerEvent.COMPLETE = 'COMPLETE';
    PlayerEvent.BUFFER_START = 'buffer_start';
    PlayerEvent.BUFFER_COMPLETE = 'buffer_complete';
    PlayerEvent.SEEK_START = 'seek_start';
    PlayerEvent.SEEK_COMPLETE = 'seek_complete';
    PlayerEvent.AD_START = "ad_start";
    PlayerEvent.AD_COMPLETE = "ad_complete";
    PlayerEvent.CHAPTER_START = "chapter_start";
    PlayerEvent.CHAPTER_COMPLETE = "chapter_complete";

    var MONITOR_TIMER_INTERVAL = 500;

    function VideoPlayer(id) {
        this.playerName = Configuration.PLAYER.NAME;
        this.videoId = Configuration.PLAYER.VIDEO_ID;
        this.streamType = ADB.va.ASSET_TYPE_VOD;

        this._videoLoaded = false;
        this._videoInfo = null;

        this._clock = null;

        this.$el = $('#' + id);

        var self = this;
        if (this.$el) {
            this.$el.on('play', function() { self._onPlay(); });
            this.$el.on('seeking', function() { self._onSeekStart(); });
            this.$el.on('seeked', function() { self._onSeekComplete(); });
            this.$el.on('pause', function() { self._onPause(); });
            this.$el.on('ended', function() { self._onComplete(); });
        }
    }

    VideoPlayer.prototype.getVideoInfo = function() {

        this._videoInfo.playhead = this.getPlayhead();
        return this._videoInfo;
    };


    VideoPlayer.prototype.getDuration = function () {
        return this.$el.get(0).duration;
    };

    VideoPlayer.prototype.getPlayhead = function () {
        return this.$el.get(0).currentTime;
    };

    VideoPlayer.prototype._onPlay = function(e) {
        if (!this._videoLoaded) {
            this._startVideo();
        }

        DefaultCommCenter().trigger(new PlayerEvent(PlayerEvent.PLAY));
    };

    VideoPlayer.prototype._onPause = function(e) {
        DefaultCommCenter().trigger(new PlayerEvent(PlayerEvent.PAUSE));
    };

    VideoPlayer.prototype._onSeekStart = function(e) {
        DefaultCommCenter().trigger(new PlayerEvent(PlayerEvent.SEEK_START));
    };

    VideoPlayer.prototype._onSeekComplete = function(e) {
        this._doPostSeekComputations();
        DefaultCommCenter().trigger(new PlayerEvent(PlayerEvent.SEEK_COMPLETE));
    };

    VideoPlayer.prototype._onComplete = function(e) {

        DefaultCommCenter().trigger(new PlayerEvent(PlayerEvent.COMPLETE));

        DefaultCommCenter().trigger(new PlayerEvent(PlayerEvent.VIDEO_UNLOAD));

        this._videoLoaded = false;
    };

    VideoPlayer.prototype._startVideo = function() {
        this._videoInfo = new VideoInfo();
        this._videoInfo.id = this.videoId;
        this._videoInfo.playerName = this.playerName;
        this._videoInfo.length = this.getDuration();
        this._videoInfo.streamType = this.streamType;
        this._videoInfo.playhead = this.getPlayhead();

        this._videoLoaded = true;

        DefaultCommCenter().trigger(new PlayerEvent(PlayerEvent.VIDEO_LOAD));
    };

    VideoPlayer.prototype._doPostSeekComputations = function() {
        var vTime = this.getPlayhead();

    };

    // Export symbols.
    CQ.Communities.Analytics.VHL.VideoPlayer = VideoPlayer;
    CQ.Communities.Analytics.VHL.PlayerEvent = PlayerEvent;
})(jQuery, CQ.Communities.Analytics.VHL.ADB, CQ.Communities.Analytics.VHL.Configuration, CQ.Communities.Analytics.VHL.DefaultCommCenter);
