import {
  microblog,
  createActor,
  canisterId,
} from "../../declarations/microblog";
import { Principal } from "@dfinity/principal";
import moment from "moment";
const formatDate = (current_datetime) => {
  return moment(current_datetime).format("YYYY-MM-DD HH:MM:SS");
};

async function post() {
  let post_message = document.getElementById("post_message");
  let post_password = document.getElementById("post_password");
  let msg = post_message.value;
  if (!msg || !msg.length) {
    window.alert("please input post message");
    return;
  }
  try {
    let res = await microblog.post(msg, post_password.value);
    if (res) {
      window.alert("post message success.");
      post_message.value = "";
      return;
    } else {
      window.alert("post message faield.");
      return;
    }
  } catch (e) {
    window.alert(e);
  }
}
async function follow() {
  let flow_pid = document.getElementById("flow_pid");
  let _pid = flow_pid.value;
  if (!_pid || !_pid.length) {
    window.alert("please input follow principal id ");
    return;
  }
  try {
    let res = await microblog.follow(Principal.fromText(_pid));
    if (res) {
      window.alert("follow success.");
      flow_pid.value = "";
      return;
    } else {
      window.alert("follow faield.");
      return;
    }
  } catch (e) {
    window.alert(e);
  }
}
function genDisplaylist(parentElement, msgList, isDisplayName) {
  for (const val of msgList) {
    let dateStr = formatDate(new Date(Number(val.time || 0) / Math.pow(10, 6)));
    let flolowItem = dateStr;
    if (isDisplayName) {
      flolowItem = dateStr + " " + val.author;
    }

    let listItem = document.createElement("div");
    listItem.innerHTML += flolowItem;
    listItem.style.cssText = "font-size: 18px;";

    let context = document.createElement("p");
    context.innerHTML = val.content;
    context.style.cssText = "background-color: rgb(139, 162, 163);";
    listItem.appendChild(context);

    parentElement && parentElement.appendChild(listItem);
  }
}
async function myPosts() {
  const myposts = await microblog.posts(0);
  let my_posts_list = document.getElementById("my_posts_list");
  myposts &&
    myposts.sort(function (a, b) {
      return Number(b.time) - Number(a.time);
    });
  genDisplaylist(my_posts_list, myposts);
}
async function folows() {
  const userFollows = await microblog.follows();
  let follows_list = document.getElementById("follows_list");
  for (const val of userFollows) {
    let _act = createActor(val.toString());
    let name = await _act.get_name();
    let flolowItem = val.toString();
    if (name) {
      flolowItem = name + "@" + val.toString();
    }
    let listItem = document.createElement("div");
    listItem.innerHTML += val.toString();
    let _element_btn = document.createElement("button");
    _element_btn.style.cssText = "margin-left: 5px;";
    _element_btn.innerHTML = name;
    _element_btn.onclick = async function () {
      let _act = createActor(val.toString());
      let _posts = await _act.posts(0);
      _posts &&
      _posts.sort(function (a, b) {
          return Number(b.time) - Number(a.time);
        });
      let select_flows = document.getElementById("timeline_list");
      select_flows.innerHTML = null
      genDisplaylist(select_flows, _posts, true);
    };
    listItem.appendChild(_element_btn);
    follows_list.appendChild(listItem);
  }
}
async function timeline() {
  const timlines = await microblog.timeline(0);
  let timeline_list = document.getElementById("timeline_list");
  timlines &&
    timlines.sort(function (a, b) {
      return Number(b.time) - Number(a.time);
    });
  genDisplaylist(timeline_list, timlines, true);
}

async function initTitle() {
  let myName = await microblog.get_name();
  let my_title = document.getElementById("my_title");
  my_title.innerHTML = myName + "@" + canisterId;
}
function init() {
  let btn_post = document.getElementById("btn_post");
  btn_post.onclick = post;
  let btn_flow = document.getElementById("btn_flow");
  btn_flow.onclick = follow;
}

init();
initTitle();
myPosts();
folows();
timeline();
