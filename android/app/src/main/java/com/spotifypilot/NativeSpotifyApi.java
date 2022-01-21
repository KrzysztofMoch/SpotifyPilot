package com.spotifypilot;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Bitmap;
import android.util.Base64;
import android.util.Log;
import com.facebook.react.bridge.*;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import com.spotify.android.appremote.api.ConnectionParams;
import com.spotify.android.appremote.api.Connector;
import com.spotify.android.appremote.api.PlayerApi;
import com.spotify.android.appremote.api.SpotifyAppRemote;
import com.spotify.android.appremote.api.error.CouldNotFindSpotifyApp;
import com.spotify.android.appremote.api.error.NotLoggedInException;
import com.spotify.android.appremote.api.error.UserNotAuthorizedException;
import com.spotify.protocol.client.CallResult;
import com.spotify.protocol.types.ImageUri;
import com.spotify.protocol.types.PlayerState;
import com.spotify.protocol.types.Track;
import com.spotify.sdk.android.auth.AuthorizationRequest;
import com.spotify.sdk.android.auth.AuthorizationResponse;
import com.spotify.sdk.android.auth.AuthorizationClient;
import org.jetbrains.annotations.NotNull;

import java.io.ByteArrayOutputStream;

public class NativeSpotifyApi extends ReactContextBaseJavaModule{

    private SpotifyAppRemote mSpotifyAppRemote;
    private final ReactApplicationContext reactContext;

    NativeSpotifyApi(ReactApplicationContext context){
        super(context);
        reactContext = context;
        SpotifyAppRemote.disconnect(mSpotifyAppRemote);
    }

    @NotNull
    public String getName() {
        return "NativeSpotifyApi";
    }

    //This Listener Return Data from Auth
    private final ActivityEventListener mActivityEventListener = new BaseActivityEventListener() {

        @Override
        public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent intent) {
            if (requestCode == 1337) {
                AuthorizationResponse response = AuthorizationClient.getResponse(resultCode, intent);

                switch (response.getType()) {
                    // Auth flow return a success
                    case TOKEN:
                        handleSuccess(response);
                        break;

                    // Auth flow returned an error
                    case ERROR:
                        handleError(response);
                        break;

                    // Most likely auth flow was cancelled
                    default:
                        handleOther();
                }
            }
        }

        private void handleSuccess(AuthorizationResponse response){
            WritableMap data = Arguments.createMap();
            data.putString("accessToken", response.getAccessToken());

            reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("AuthorizationResponse", data);
        }

        private void handleError(AuthorizationResponse response){
            WritableMap data = Arguments.createMap();
            data.putString("error", response.getAccessToken());

            reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("AuthorizationResponse", data);
        }

        private void handleOther(){
            WritableMap data = Arguments.createMap();
            data.putString("type", "cancel");

            reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("AuthorizationResponse", data);
        }
    };

    private void SetPlayerStateListener(){
        mSpotifyAppRemote.getPlayerApi().subscribeToPlayerState().setEventCallback(playerState -> {
            reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("playerStateChange", EmitPlayerStateChange(playerState));
        });
    }

    private WritableMap EmitPlayerStateChange(PlayerState playerState){
        final Track track = playerState.track;

        WritableMap data = Arguments.createMap();
        data.putString("name", track.name);
        data.putString("artist", track.artist.name);
        data.putInt("duration", (int) track.duration);
        data.putBoolean("isPaused", playerState.isPaused);
        data.putBoolean("canSkipNext", playerState.playbackRestrictions.canSkipNext);
        data.putBoolean("canSkipPrev", playerState.playbackRestrictions.canSkipPrev);
        data.putBoolean("canToggleShuffle", playerState.playbackRestrictions.canToggleShuffle);
        data.putBoolean("isShuffling", playerState.playbackOptions.isShuffling);
        data.putInt("repeatMode", playerState.playbackOptions.repeatMode);
        Log.d("EVENTTEST", String.valueOf(playerState.isPaused));

        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("playerStateChange", data);

        GetImage(track.imageUri);

        return data;
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    public void AuthorizeApi(String clientId, String redirectUri, String scopes){
        AuthorizationRequest.Builder builder = new AuthorizationRequest.Builder(clientId, AuthorizationResponse.Type.TOKEN, redirectUri);

        builder.setScopes(scopes.split(","));
        AuthorizationRequest request = builder.build();

        Activity activity = getCurrentActivity();

        reactContext.addActivityEventListener(mActivityEventListener);
        AuthorizationClient.openLoginActivity(activity, 1337, request);
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    public void AuthorizePlayer(String clientId, String redirectUrl, boolean showAuthView){
        ConnectionParams connectionParams = new ConnectionParams.Builder(clientId).setRedirectUri(redirectUrl).showAuthView(showAuthView).build();

        SpotifyAppRemote.connect(reactContext, connectionParams, new Connector.ConnectionListener() {
            @Override
            public void onConnected(SpotifyAppRemote spotifyAppRemote) {
                mSpotifyAppRemote = spotifyAppRemote;
                reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("AuthorizePlayer", "success");
                SetPlayerStateListener();
            }

            @Override
            public void onFailure(Throwable error) {
                if(error instanceof NotLoggedInException || error instanceof UserNotAuthorizedException){
                    reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("AuthorizePlayer", "notLoggedInSpotify");
                }
                else if (error instanceof CouldNotFindSpotifyApp){
                    reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("AuthorizePlayer", "spotifyNotInstalled");
                }

                reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("AuthorizePlayer", error.getMessage());
            }
        });
    }

    @ReactMethod
    public void GetPlaceInSong(Promise promise){
        if(mSpotifyAppRemote == null){
            return;
        }

        try {
            PlayerState playerState = mSpotifyAppRemote.getPlayerApi().getPlayerState().await().getData();
            promise.resolve((int) playerState.playbackPosition);
        } catch(Exception e) {
            promise.reject("error","Error while GetPlaceInSong", e);
        }
    }

    private void GetImage(ImageUri uri){
        if(mSpotifyAppRemote == null){
            return;
        }
        CallResult<Bitmap> bitmap = mSpotifyAppRemote.getImagesApi().getImage(uri);
        bitmap.setResultCallback(image -> {
            ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
            image.compress(Bitmap.CompressFormat.PNG, 100, byteArrayOutputStream);
            byte[] byteArray = byteArrayOutputStream.toByteArray();

            reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("ImageLoaded", Base64.encodeToString(byteArray, Base64.DEFAULT));
        });
    }

    //There are Player Methods
    @ReactMethod(isBlockingSynchronousMethod = true)
    public void PlaySong(String uri){
        if(mSpotifyAppRemote == null){
            return;
        }

        mSpotifyAppRemote.getPlayerApi().play(uri);
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    public void PlayerAction(String action){
        if(mSpotifyAppRemote == null){
            return;
        }

        PlayerApi player = mSpotifyAppRemote.getPlayerApi();

        switch (action){
            case "next":
                player.skipNext();
                break;
            case "prev":
                player.skipPrevious();
                break;
            case "pause":
                player.pause();
                break;
            case "resume":
                player.resume();
                break;
            case "toggleShuffle":
                player.toggleShuffle();
                break;
            case "toggleRepeat":
                player.toggleRepeat();
                break;
        }
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    public void PlayerSneakTo(double location){
        if(mSpotifyAppRemote == null){
            return;
        }

        Log.d("PlayerSneakTo", "do " + location + " lo " + (long) location + "");
        PlayerApi player  = mSpotifyAppRemote.getPlayerApi();
        // this can be used to forward 10s ex. player.seekToRelativePosition();
        player.seekTo((long) location);
    }
}
