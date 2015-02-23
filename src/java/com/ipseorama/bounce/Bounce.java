/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.ipseorama.bounce;

import java.io.IOException;
import java.io.StringWriter;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonWriter;
import javax.websocket.EndpointConfig;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

/**
 *
 * @author Westhawk Ltd<thp@westhawk.co.uk>
 */
@ServerEndpoint("/bounce")

public class Bounce {

    String jsonIdle;

    Bounce() {
        JsonObject ans = Json.createObjectBuilder()
                .add("type", "idle").build();
        StringWriter stWriter = new StringWriter();
        try (JsonWriter jsonWriter = Json.createWriter(stWriter)) {
            jsonWriter.writeObject(ans);
        }
        jsonIdle = stWriter.toString();
    }

    @OnOpen
    public void onOpen(Session session, EndpointConfig config) {
        try {
            System.err.print("Sending "+jsonIdle);
            session.getBasicRemote().sendText(jsonIdle);
        } catch (IOException ex) {
            Logger.getLogger(Bounce.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    @OnMessage
    public void handleMessage(String message, Session session) {
        System.err.print("Got >"+message);
              /* clever stuff happens here 
      try {
            JsonObject ans = Json.createObjectBuilder()
                    .add("type", "answer").build();
            StringWriter stWriter = new StringWriter();
            try (JsonWriter jsonWriter = Json.createWriter(stWriter)) {
                jsonWriter.writeObject(ans);
            }
            String jsonData = stWriter.toString();
            session.getBasicRemote().sendText(jsonData);
        } catch (IOException ex) {
            Logger.getLogger(Bounce.class.getName()).log(Level.SEVERE, null, ex);
        }
                      */

    }

}
