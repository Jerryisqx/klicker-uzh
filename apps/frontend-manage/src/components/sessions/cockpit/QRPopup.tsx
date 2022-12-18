import { faQrcode } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import QR from '@pages/qr/[...args]'
import { Button, Modal, ThemeContext } from '@uzh-bf/design-system'
import Link from 'next/link'
import React, { useContext, useState } from 'react'
import { twMerge } from 'tailwind-merge'

interface Props {
  id: string
}

function QRPopup({ id }: Props): React.ReactElement {
  const theme = useContext(ThemeContext)
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <Modal
      trigger={
        <Button
          className={{ root: 'w-[41%] sm:w-max !mr-0' }}
          onClick={() => setModalOpen(true)}
        >
          <Button.Icon>
            <FontAwesomeIcon icon={faQrcode} />
          </Button.Icon>
          QR Code
        </Button>
      }
      open={modalOpen}
      onClose={() => setModalOpen(false)}
    >
      <div>
        <div className="font-bold">
          <Link
            href={`https://pwa.klicker.uzh.ch/session/${id}`}
            legacyBehavior
          >{`https://pwa.klicker.uzh.ch/session/${id}`}</Link>
        </div>

        <div>
          <QR path={`/session/${id}`} width={200} />
        </div>

        <Link passHref href={`/qr/session/${id}`} target="_blank">
          <Button
            fluid
            className={{
              root: twMerge(
                'text-lg font-bold text-white h-11',
                theme.primaryBgDark
              ),
            }}
          >
            <Button.Label>QR-Code präsentieren</Button.Label>
          </Button>
        </Link>
      </div>
    </Modal>
  )
}

export default QRPopup
