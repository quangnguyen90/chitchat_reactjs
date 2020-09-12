import React from "react";
import { Grid, makeStyles } from "@material-ui/core";
import NavigateBar from "features/Message/components/NavigateBar";
import MenuChat from "features/Message/components/MenuChat";
import ChatForm from "features/Message/components/ChatForm";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import userApi from "api/userApi";
import messageApi from "api/messageApi";
import { useState } from "react";
import Loading from "components/Loading";
import Search from "features/Message/components/Search";

const useStyles = makeStyles({
  root: {
    height: "100%",
  },
  leftSideBar: {
    height: "100%",
    backgroundColor: "white",
  },
  navigate: {
    height: "100%",
  },
  menu: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    padding: "20px 20px",
  },
  chatForm: {
    height: "100%",
  },
});

function Main(props) {
  const classes = useStyles();
  const { currentUserId } = useSelector((state) => state.user);
  const { showChatForm } = useSelector((state) => state.message);
  const [groupChats, setGroupChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    messageApi.groupChatsListener(currentUserId, (snapshot) => {
      if (!snapshot.val()) {
        setLoading(false);
        return;
      }

      const groupChats = snapshot.val();
      let belongGroups = [];
      for (let groupChatKey in groupChats) {
        const { members } = groupChats[groupChatKey];
        for (let memberKey in members) {
          if (members[memberKey] === currentUserId) {
            belongGroups = belongGroups.concat(groupChats[groupChatKey]);
          }
        }
      }

      debugger;

      if (belongGroups.length === 0) {
        setLoading(false);
        return;
      }

      let standardizedList = [];

      belongGroups.forEach((groupChat) => {
        const { id, name, members } = groupChat;
        messageApi.getLastMessage(id).then((message) => {
          const { senderId, content, timestamp } = message;
          userApi.getUserInfo(senderId).then((userInfo) => {
            const { firstName, lastName } = userInfo;
            if (members.length === 2) {
              standardizedList = standardizedList.concat({
                id,
                name: firstName + " " + lastName,
                senderId,
                content,
                timestamp,
              });
            } else {
              standardizedList = standardizedList.concat({
                id,
                name,
                senderId,
                senderName: firstName + " " + lastName,
                content,
                timestamp,
              });
            }
            if (standardizedList.length === belongGroups.length) {
              setGroupChats(standardizedList);
              setLoading(false);
            }
          });
        });
      });
    });
  }, []);

  return (
    <Grid container className={classes.root}>
      <Grid container item sm={3} className={classes.leftSideBar}>
        <Grid item sm={2} className={classes.navigate}>
          <NavigateBar />
        </Grid>
        <Grid item sm={10} className={classes.menu}>
          <Search />
          {loading ? <Loading /> : <MenuChat groupChats={groupChats} />}
        </Grid>
      </Grid>
      <Grid item sm={9} className={classes.chatForm}>
        {showChatForm ? <ChatForm /> : ""}
      </Grid>
    </Grid>
  );
}

export default Main;
