# RetrOS Video Assets

Place your video files in this directory for use with the VideoPlayer app and RetroScript `video` command.

## Directory Structure

```
assets/videos/
├── README.md
├── intro.mp4
├── cutscene.webm
└── (your custom videos)
```

## Supported Formats

- MP4 (recommended)
- WebM
- OGG

## RetroScript Usage

### Playing Videos with the `video` Command
```retro
# Basic playback
video "assets/videos/intro.mp4"

# With options
video "assets/videos/cutscene.mp4" volume=0.8

# Loop a video
video "assets/videos/ambient.mp4" loop=true

# Using variables
set $cutscene = "assets/videos/ending.mp4"
video $cutscene
```

### Launching VideoPlayer with `launch`
```retro
# Open VideoPlayer with a specific video
launch videoplayer with src="assets/videos/movie.mp4"
```

### Event Handling
```retro
# React to video events
on videoplayer:ended {
    print "Video finished!"
    play achievement
}

on videoplayer:play {
    print "Video started playing"
}

on videoplayer:pause {
    print "Video paused"
}

# Handle playlist end
on videoplayer:playlist:ended {
    print "All videos finished"
    emit game:complete
}
```

## Video Events

The VideoPlayer emits these events for script integration:

| Event | Description | Payload |
|-------|-------------|---------|
| `videoplayer:play` | Video started playing | `{ video, currentTime }` |
| `videoplayer:pause` | Video paused | `{ currentTime }` |
| `videoplayer:stop` | Video stopped | `{ }` |
| `videoplayer:ended` | Video finished | `{ video, index }` |
| `videoplayer:loaded` | Video metadata loaded | `{ duration }` |
| `videoplayer:error` | Playback error | `{ error }` |
| `videoplayer:seek` | Seek position changed | `{ position }` |
| `videoplayer:timeupdate` | Time updated | `{ currentTime, duration }` |
| `videoplayer:fullscreen` | Fullscreen toggled | `{ fullscreen }` |
| `videoplayer:playing` | Video actively playing | `{ video, index }` |
| `videoplayer:playlist:add` | Video added to playlist | `{ video }` |
| `videoplayer:playlist:ended` | Playlist finished | `{ }` |

## Video Player Commands (Scripting)

The VideoPlayer registers these commands for direct control:

```retro
# Control playback
exec videoplayer.play
exec videoplayer.pause
exec videoplayer.stop

# Navigate playlist
exec videoplayer.next
exec videoplayer.previous
exec videoplayer.playVideo(0)

# Volume and seeking
exec videoplayer.setVolume(80)
exec videoplayer.seek(30)

# Fullscreen
exec videoplayer.fullscreen
exec videoplayer.mute

# Load a new video
exec videoplayer.load("assets/videos/new.mp4", "My Video")
```

## Queries

Get VideoPlayer state in scripts:

```retro
# Get current state
set $state = query videoplayer.getState
print $state.playing
print $state.currentTime
print $state.duration

# Get playlist
set $playlist = query videoplayer.getPlaylist
print $playlist

# Get current video info
set $current = query videoplayer.getCurrentVideo
print $current.video.name
```

## Example: ARG Cutscene Integration

```retro
# EREBUS cutscene example
on puzzle:solved {
    # Play victory cutscene
    video "assets/videos/erebus/victory.mp4" volume=0.7
}

on videoplayer:ended {
    # After cutscene, progress the story
    set $act = $act + 1
    write "ACT " + $act to "C:/Users/User/Desktop/EREBUS/PROGRESS.txt"
    alert "Act " + $act + " Complete!"
}

# Atmospheric background video
on app:erebus:start {
    video "assets/videos/erebus/static.mp4" loop=true volume=0.2
}
```
