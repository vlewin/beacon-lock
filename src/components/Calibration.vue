<template>
  <div id="calibration">
    <div class="device">
      <img src="../assets/images/macbook.svg" />
    </div>

    <div class="content">
      <div class="content-top">
        <div class="grey-text">
          POSITION YOUR BEACON IN THE 'UNLOCK' ZONE
        </div>
        <div>
          <h2>CALIBRATING ...</h2>
        </div>
      </div>
      <div class="content-bottom">
        <div class="beacon">BEACON</div>
      </div>
    </div>

  </div>

</template>

<style>
.grey-text {
  color: #aaa;
}

#calibration {
  display: flex;
  /* align-items: center; */
  flex-direction: column;
  /* justify-content: center; */
  height: 100%;
}

.device {
  align-self: flex-start;
  justify-content: center;
  width: 100%;
  display: flex;
  height: 50%;
  text-align: center;
}

.content{
  align-self: center;
  justify-content: flex-end;
  height: 50%;
  width: 100%;
  flex-direction: column;
  display: flex;
}

.content-top {
  height: 50%;
  align-items: center;
  text-align: center;
  width: 100%;
  justify-content: center;
}

.content-top div {
  height: 50%;
}

.content-bottom  {
  height: 50%;
  display: flex;
  align-items: center;
  text-align: center;
  width: 100%;
  justify-content: center;
}

div.beacon {
  height: 100px;
  width: 100px;
  line-height: 100px;
  border: 2px solid grey;
  text-align: center;
  border-radius: 100%;
}

</style>
