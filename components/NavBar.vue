<template>
  <div>
    <nav
      class="navbar is-fixed-top has-shadow"
      role="navigation"
      aria-label="main navigation"
    >
      <div class="container">
        <div class="navbar-brand">
          <nuxt-link class="navbar-item" to="/">
            <img class="logo" width="150" src="~assets/img/logo.svg" />
            <span class="subtitle is-7">EXPLORER</span>
          </nuxt-link>

          <a
            role="button"
            class="navbar-burger"
            aria-label="menu"
            aria-expanded="false"
            data-target="navbar"
            @click="mobileMenu = !mobileMenu"
          >
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </a>
        </div>
        <div
          id="navbar"
          class="navbar-menu"
          :class="{ 'is-active': mobileMenu }"
        >
          <div class="navbar-start"></div>
          <div class="navbar-end is-align-items-center">
            <div @click="mobileMenu = false">
              <nuxt-link
                class="navbar-item"
                to="/jobs"
                exact-active-class="is-active"
              >
                Jobs
              </nuxt-link>
            </div>
            <!-- <div @click="mobileMenu = false">
              <nuxt-link
                class="navbar-item"
                to="/nodes"
                exact-active-class="is-active"
              >
                Nodes
              </nuxt-link>
            </div> -->
            <div @click="mobileMenu = false">
              <nuxt-link
                class="navbar-item"
                to="/markets"
                exact-active-class="is-active"
              >
                Markets
              </nuxt-link>
            </div>
            <div class="navbar-item" exact-active-class="is-active">
              <div>
                <div class="select">
                  <select v-model="network" @change="mobileMenu = false">
                    <option value="devnet">DevNet</option>
                    <option value="mainnet">TestGrid</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  </div>
</template>

<script lang="ts" setup>
const mobileMenu = ref(false);
const { network } = useSDK();
</script>

<style lang="scss">
.navbar {
  backdrop-filter: blur(6px);
  background: rgba(white, 0.7);
  &.is-transparent {
    background: transparent;
  }

  .navbar-brand {
    .navbar-item {
      img {
        max-height: 2.5rem;
      }
      &.is-active,
      &:hover {
        color: $primary;
      }
    }
  }

  .navbar-burger {
    height: auto;
  }

  .navbar-menu {
    margin-top: 8px;
    margin-bottom: 8px;
    justify-content: center;
    .navbar-item {
      font-weight: 600;
      padding: 10px 20px;
      text-align: center;
      &.social-icon {
        img {
          transition: transform 0.3s;
        }
        &:hover {
          background: none;
          img {
            transform: scale(1.15);
          }
        }
      }
      &:after {
        display: block;
        width: 0;
        height: 2px;
        position: absolute;
        transition: width 0.5s;
        bottom: 10px;
        background: $primary;
        content: '';
      }
      &.is-active {
        color: $primary;
        font-weight: 700;
        &:after {
          width: calc(100% - 1.5rem - 15px);
        }
      }
    }
  }
}
</style>
